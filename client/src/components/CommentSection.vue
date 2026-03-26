<template>
  <div class="comment-section">
    <h3 class="text-xl font-bold text-gray-800 mb-6">评论 ({{ totalComments }})</h3>

    <!-- 评论列表 -->
    <div v-if="loading" class="py-4 text-center">
      <div
        class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"
      ></div>
    </div>

    <div v-else-if="comments.length === 0" class="text-center py-6 text-gray-500">
      暂无评论，成为第一个评论的人吧！
    </div>

    <div v-else class="space-y-6 mb-8">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :post-id="postId"
        @refresh="fetchComments"
      />
    </div>

    <!-- 评论输入框 -->
    <div class="border-t pt-6">
      <h4 class="text-lg font-semibold mb-4">发表评论</h4>

      <div v-if="!isLoggedIn" class="bg-gray-50 p-4 rounded text-center">
        <p class="text-gray-600 mb-2">登录后才能发表评论</p>
        <router-link to="/login" class="text-blue-600 hover:underline"> 立即登录 </router-link>
      </div>

      <div v-else>
        <div class="mb-4">
          <textarea
            v-model="newComment"
            class="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500"
            rows="4"
            placeholder="写下你的评论..."
          ></textarea>
        </div>

        <div class="flex justify-end">
          <button
            :disabled="!newComment.trim() || submitting"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg"
            @click="submitComment"
          >
            <span v-if="submitting">提交中...</span>
            <span v-else>发表评论</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/auth';
import CommentItem from './CommentItem.vue';
import api from '../api';

// Props
const props = defineProps({
  postId: {
    type: [Number, String],
    required: true,
  },
});

const { isLoggedIn } = storeToRefs(useAuthStore());

// 状态
const comments = ref([]);
const loading = ref(true);
const newComment = ref('');
const submitting = ref(false);

// 计算属性
const totalComments = computed(() => {
  let count = comments.value.length;
  // 添加所有回复的数量
  comments.value.forEach((comment) => {
    if (comment.replies && Array.isArray(comment.replies)) {
      count += comment.replies.length;
    }
  });
  return count;
});

// 方法
const fetchComments = async () => {
  loading.value = true;
  try {
    comments.value = await api.getPostComments(props.postId);
  } catch (error) {
    console.error('获取评论失败:', error);
    comments.value = [];
  } finally {
    loading.value = false;
  }
};

const submitComment = async () => {
  if (!newComment.value.trim() || submitting.value) return;

  submitting.value = true;
  try {
    await api.createComment(props.postId, {
      content: newComment.value,
      parentId: null, // 顶层评论
    });

    // 清空输入框并刷新评论
    newComment.value = '';
    await fetchComments();
  } catch (error) {
    console.error('提交评论失败:', error);
    alert('评论提交失败，请重试');
  } finally {
    submitting.value = false;
  }
};

// 生命周期钩子
onMounted(() => {
  fetchComments();
});
</script>
