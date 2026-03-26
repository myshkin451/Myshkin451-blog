<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h2 class="text-lg font-semibold mb-4">最新评论</h2>
    <div v-if="comments.length === 0" class="text-gray-500 text-center py-4">暂无评论</div>
    <div v-else>
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="border-b last:border-b-0 pb-4 mb-4 last:pb-0 last:mb-0"
      >
        <div class="flex items-start">
          <img
            :src="comment.user?.avatar || '/img/default-avatar.png'"
            alt="用户头像"
            class="w-10 h-10 rounded-full mr-3"
          />
          <div class="flex-1">
            <div class="flex justify-between items-start">
              <div>
                <span class="font-medium text-gray-900">{{
                  comment.user?.username || '未知用户'
                }}</span>
                <span class="ml-2 text-sm text-gray-500">{{ formatDate(comment.createdAt) }}</span>
              </div>
              <div class="flex items-center">
                <span
                  class="px-2 py-1 text-xs rounded-full"
                  :class="getStatusClass(comment.status)"
                >
                  {{ getStatusText(comment.status) }}
                </span>
                <div class="ml-2">
                  <button
                    v-if="comment.status !== 'approved'"
                    class="text-xs text-green-600 hover:text-green-800"
                    @click="$emit('approve', comment)"
                  >
                    通过
                  </button>
                  <button
                    v-if="comment.status !== 'rejected'"
                    class="text-xs text-red-600 hover:text-red-800 ml-2"
                    @click="$emit('reject', comment)"
                  >
                    拒绝
                  </button>
                </div>
              </div>
            </div>
            <p class="text-gray-700 mt-1">{{ comment.content }}</p>
            <div class="mt-1 text-sm">
              <a
                :href="`/posts/${comment.postId}`"
                target="_blank"
                class="text-blue-600 hover:text-blue-900"
                >查看文章</a
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  comments: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['approve', 'reject']);

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
</script>
