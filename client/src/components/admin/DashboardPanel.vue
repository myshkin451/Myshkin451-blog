<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard title="文章" :count="stats.postCount" icon="document" color="blue" />
      <StatCard title="评论" :count="stats.commentCount" icon="chat" color="green" />
      <StatCard title="分类" :count="stats.categoryCount" icon="folder" color="purple" />
      <StatCard title="标签" :count="stats.tagCount" icon="tag" color="yellow" />
    </div>

    <RecentPosts v-if="recentPosts.length > 0" :posts="recentPosts" />
    <RecentComments v-if="recentComments.length > 0" :comments="recentComments" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import StatCard from './StatCard.vue';
import RecentPosts from './RecentPosts.vue';
import RecentComments from './RecentComments.vue';
import api from '../../api';

const stats = ref({ postCount: 0, commentCount: 0, categoryCount: 0, tagCount: 0 });
const recentPosts = ref([]);
const recentComments = ref([]);

onMounted(async () => {
  const [statsRes, postsRes, commentsRes] = await Promise.all([
    api.getAdminStats(),
    api.getPosts({ limit: 5 }),
    api.getRecentComments(5),
  ]);

  stats.value = statsRes;
  recentPosts.value = Array.isArray(postsRes) ? postsRes.slice(0, 5) :
                      (postsRes.posts ? postsRes.posts.slice(0, 5) : []);
  recentComments.value = commentsRes.comments || [];
});
</script>
