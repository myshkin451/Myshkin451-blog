<template>
  <div class="comments-manager">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold">评论管理</h2>
      <div class="flex gap-2">
        <select
          v-model="statusFilter"
          class="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          @change="filterComments"
        >
          <option value="">所有状态</option>
          <option value="pending">待审核</option>
          <option value="approved">已通过</option>
          <option value="rejected">已拒绝</option>
        </select>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="bg-white shadow rounded-lg p-6">
      <div v-if="loading" class="text-center py-6">
        <div
          class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"
        ></div>
        <p class="mt-2 text-gray-600">加载中...</p>
      </div>

      <div v-else-if="comments.length === 0" class="text-center py-6 text-gray-500">
        没有找到评论
      </div>

      <div v-else class="space-y-6">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="border-b last:border-b-0 pb-6 mb-6 last:pb-0 last:mb-0"
        >
          <div class="flex items-start">
            <img
              :src="comment.user?.avatar || '/img/default-avatar.png'"
              alt="用户头像"
              class="w-10 h-10 rounded-full mr-3"
            />
            <div class="flex-1">
              <div class="flex flex-wrap justify-between items-start">
                <div>
                  <span class="font-medium text-gray-900">{{
                    comment.user?.username || '未知用户'
                  }}</span>
                  <span class="ml-2 text-sm text-gray-500">{{
                    formatDate(comment.createdAt)
                  }}</span>
                  <span
                    class="ml-2 px-2 py-1 text-xs rounded-full"
                    :class="getStatusClass(comment.status)"
                  >
                    {{ getStatusText(comment.status) }}
                  </span>
                </div>
                <div class="flex gap-2 mt-1 sm:mt-0">
                  <button
                    v-if="comment.status !== 'approved'"
                    class="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    @click="updateCommentStatus(comment.id, 'approved')"
                  >
                    通过
                  </button>
                  <button
                    v-if="comment.status !== 'rejected'"
                    class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    @click="updateCommentStatus(comment.id, 'rejected')"
                  >
                    拒绝
                  </button>
                  <button
                    class="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    @click="confirmDeleteComment(comment)"
                  >
                    删除
                  </button>
                </div>
              </div>

              <p class="text-gray-700 mt-2">{{ comment.content }}</p>

              <div class="mt-2 bg-gray-50 p-2 rounded text-sm">
                <span class="text-gray-600">文章:</span>
                <a
                  :href="`/posts/${comment.postId}`"
                  target="_blank"
                  class="ml-1 text-blue-600 hover:text-blue-900"
                >
                  {{ comment.post?.title || `文章ID: ${comment.postId}` }}
                </a>
              </div>

              <!-- 子评论(回复) -->
              <div
                v-if="comment.replies && comment.replies.length > 0"
                class="mt-4 pl-4 border-l-2 border-gray-200"
              >
                <div v-for="reply in comment.replies" :key="reply.id" class="mb-3 last:mb-0">
                  <div class="flex items-start">
                    <img
                      :src="reply.user?.avatar || '/img/default-avatar.png'"
                      alt="回复用户头像"
                      class="w-8 h-8 rounded-full mr-2"
                    />
                    <div>
                      <div class="flex items-center flex-wrap">
                        <span class="font-medium text-gray-800">{{
                          reply.user?.username || '未知用户'
                        }}</span>
                        <span class="ml-2 text-xs text-gray-500">{{
                          formatDate(reply.createdAt)
                        }}</span>
                        <span
                          class="ml-2 px-2 py-0.5 text-xs rounded-full"
                          :class="getStatusClass(reply.status)"
                        >
                          {{ getStatusText(reply.status) }}
                        </span>
                      </div>
                      <p class="text-gray-700 text-sm mt-1">{{ reply.content }}</p>
                      <div class="flex gap-2 mt-1 text-xs">
                        <button
                          v-if="reply.status !== 'approved'"
                          class="text-green-600 hover:text-green-800"
                          @click="updateCommentStatus(reply.id, 'approved')"
                        >
                          通过
                        </button>
                        <button
                          v-if="reply.status !== 'rejected'"
                          class="text-red-600 hover:text-red-800"
                          @click="updateCommentStatus(reply.id, 'rejected')"
                        >
                          拒绝
                        </button>
                        <button
                          class="text-gray-600 hover:text-gray-800"
                          @click="confirmDeleteComment(reply)"
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api';

const comments = ref([]);
const loading = ref(true);
const statusFilter = ref('');

// 获取评论列表
const fetchComments = async () => {
  loading.value = true;
  try {
    const response = await api.getAllComments(statusFilter.value);
    comments.value = response.comments || [];
  } catch (error) {
    console.error('获取评论失败:', error);
    comments.value = [];
  } finally {
    loading.value = false;
  }
};

// 筛选评论
const filterComments = () => {
  fetchComments();
};

// 更新评论状态
const updateCommentStatus = async (commentId, status) => {
  try {
    await api.updateCommentStatus(commentId, status);
    alert('评论状态已更新');
    // 刷新列表
    fetchComments();
  } catch (error) {
    console.error('更新评论状态失败:', error);
    alert('更新评论状态失败: ' + (error.response?.data?.message || '未知错误'));
  }
};

// 确认删除评论
const confirmDeleteComment = async (comment) => {
  if (confirm('确定要删除这条评论吗？此操作不可恢复。')) {
    try {
      await api.deleteComment(comment.id);
      alert('评论已成功删除');
      // 刷新列表
      fetchComments();
    } catch (error) {
      console.error('删除评论失败:', error);
      alert('删除评论失败: ' + (error.response?.data?.message || '未知错误'));
    }
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 获取状态样式
const getStatusClass = (status) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'approved':
      return '已通过';
    case 'rejected':
      return '已拒绝';
    default:
      return '待审核';
  }
};

onMounted(() => {
  fetchComments();
});
</script>
