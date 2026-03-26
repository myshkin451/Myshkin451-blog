<template>
  <div class="comment-item border-b pb-4 last:border-b-0 last:pb-0">
    <!-- 主评论内容 -->
    <div class="flex space-x-4">
      <!-- 用户头像 -->
      <div class="flex-shrink-0">
        <img
          v-if="comment.user?.avatar"
          :src="comment.user.avatar"
          alt="用户头像"
          class="w-10 h-10 rounded-full object-cover"
        />
        <div
          v-else
          class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600"
        >
          {{ comment.user?.username?.[0] || '?' }}
        </div>
      </div>

      <!-- 评论内容 -->
      <div class="flex-grow">
        <div class="flex items-center mb-1">
          <span class="font-semibold text-gray-800">{{
            comment.user?.username || '未知用户'
          }}</span>
          <span class="text-xs text-gray-500 ml-2">{{ formatDate(comment.createdAt) }}</span>
        </div>

        <!-- 编辑模式 -->
        <div v-if="isEditing" class="mb-2">
          <textarea
            v-model="editContent"
            class="w-full p-2 border rounded focus:ring focus:ring-blue-200 focus:border-blue-500"
            rows="3"
          ></textarea>
          <div class="flex justify-end space-x-2 mt-2">
            <button
              class="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
              @click="isEditing = false"
            >
              取消
            </button>
            <button
              :disabled="submitting"
              class="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded"
              @click="updateComment"
            >
              保存
            </button>
          </div>
        </div>

        <!-- 普通显示模式 -->
        <p v-else class="text-gray-700 mb-2">{{ comment.content }}</p>

        <!-- 操作按钮 -->
        <div class="flex space-x-4 text-sm text-gray-500">
          <button v-if="!isEditing" class="hover:text-blue-600" @click="toggleReplyForm">
            回复
          </button>
          <button v-if="canEdit && !isEditing" class="hover:text-blue-600" @click="startEditing">
            编辑
          </button>
          <button v-if="canEdit && !isEditing" class="hover:text-red-600" @click="confirmDelete">
            删除
          </button>
        </div>

        <!-- 回复表单 -->
        <div v-if="showReplyForm" class="mt-4">
          <textarea
            v-model="replyContent"
            class="w-full p-2 border rounded focus:ring focus:ring-blue-200 focus:border-blue-500"
            rows="2"
            placeholder="写下你的回复..."
          ></textarea>
          <div class="flex justify-end space-x-2 mt-2">
            <button
              class="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
              @click="showReplyForm = false"
            >
              取消
            </button>
            <button
              :disabled="!replyContent.trim() || submitting"
              class="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded"
              @click="submitReply"
            >
              回复
            </button>
          </div>
        </div>

        <!-- 嵌套回复 -->
        <div
          v-if="comment.replies && comment.replies.length > 0"
          class="mt-4 pl-4 border-l-2 border-gray-200 space-y-4"
        >
          <!-- 递归显示每条回复 -->
          <div v-for="reply in comment.replies" :key="reply.id" class="py-2">
            <div class="flex space-x-3">
              <!-- 回复用户头像 -->
              <div class="flex-shrink-0">
                <img
                  v-if="reply.user?.avatar"
                  :src="reply.user.avatar"
                  alt="用户头像"
                  class="w-8 h-8 rounded-full object-cover"
                />
                <div
                  v-else
                  class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm"
                >
                  {{ reply.user?.username?.[0] || '?' }}
                </div>
              </div>

              <!-- 回复内容 -->
              <div class="flex-grow">
                <div class="flex items-center mb-1">
                  <span class="font-semibold text-gray-800">{{
                    reply.user?.username || '未知用户'
                  }}</span>
                  <span class="text-xs text-gray-500 ml-2">{{ formatDate(reply.createdAt) }}</span>
                </div>
                <p class="text-gray-700">{{ reply.content }}</p>

                <!-- 回复的操作按钮 -->
                <div v-if="isLoggedIn" class="flex space-x-4 text-xs text-gray-500 mt-1">
                  <button class="hover:text-blue-600" @click="toggleReplyForm">回复</button>
                  <button
                    v-if="isCurrentUser(reply.userId)"
                    class="hover:text-red-600"
                    @click="confirmDeleteReply(reply.id)"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/auth';
import api from '../api';

// Props
const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
  postId: {
    type: [Number, String],
    required: true,
  },
});

// Emits
const emit = defineEmits(['refresh']);

const { isLoggedIn, currentUserId } = storeToRefs(useAuthStore());

// 状态
const isEditing = ref(false);
const editContent = ref(props.comment.content || '');
const showReplyForm = ref(false);
const replyContent = ref('');
const submitting = ref(false);

// 计算属性
const canEdit = computed(() => {
  return isCurrentUser(props.comment.userId);
});

// 方法
const isCurrentUser = (userId) => {
  return currentUserId.value && currentUserId.value === userId;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const toggleReplyForm = () => {
  if (!isLoggedIn.value) {
    alert('请先登录再回复评论');
    return;
  }
  showReplyForm.value = !showReplyForm.value;
  if (!showReplyForm.value) {
    replyContent.value = '';
  }
};

const startEditing = () => {
  editContent.value = props.comment.content || '';
  isEditing.value = true;
};

const updateComment = async () => {
  if (!editContent.value.trim() || submitting.value) return;

  submitting.value = true;
  try {
    await api.updateComment(props.comment.id, editContent.value);
    isEditing.value = false;
    emit('refresh');
  } catch (error) {
    console.error('更新评论失败:', error);
    alert('评论更新失败，请重试');
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = () => {
  if (confirm('确定要删除这条评论吗？此操作不可撤销，评论下的所有回复也将被删除。')) {
    deleteComment();
  }
};

const deleteComment = async () => {
  submitting.value = true;
  try {
    await api.deleteComment(props.comment.id);
    emit('refresh');
  } catch (error) {
    console.error('删除评论失败:', error);
    alert('评论删除失败，请重试');
  } finally {
    submitting.value = false;
  }
};

const confirmDeleteReply = (replyId) => {
  if (confirm('确定要删除这条回复吗？此操作不可撤销。')) {
    deleteReply(replyId);
  }
};

const deleteReply = async (replyId) => {
  submitting.value = true;
  try {
    await api.deleteComment(replyId);
    emit('refresh');
  } catch (error) {
    console.error('删除回复失败:', error);
    alert('回复删除失败，请重试');
  } finally {
    submitting.value = false;
  }
};

const submitReply = async () => {
  if (!replyContent.value.trim() || submitting.value) return;

  submitting.value = true;
  try {
    await api.createComment(props.postId, {
      content: replyContent.value,
      parentId: props.comment.id,
    });

    replyContent.value = '';
    showReplyForm.value = false;
    emit('refresh');
  } catch (error) {
    console.error('提交回复失败:', error);
    alert('回复提交失败，请重试');
  } finally {
    submitting.value = false;
  }
};
</script>
