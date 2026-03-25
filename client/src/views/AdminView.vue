<template>
  <div class="admin-view">
    <Navbar />
    
    <div class="container mx-auto px-4 py-8">
      <div class="bg-white shadow-sm rounded-lg border p-6 mb-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">管理后台</h1>
        
        <!-- 管理区域选项卡 -->
        <div class="mb-6">
          <div class="border-b">
            <nav class="flex -mb-px">
              <button 
                v-for="tab in tabs" 
                :key="tab.id"
                @click="activeTab = tab.id"
                class="py-2 px-4 mr-2 font-medium text-sm leading-5 focus:outline-none"
                :class="activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'"
              >
                {{ tab.name }}
              </button>
            </nav>
          </div>
        </div>
        
        <!-- 仪表盘 -->
        <div v-if="activeTab === 'dashboard'" class="tab-content">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard title="文章" :count="stats.postCount" icon="document" color="blue" />
            <StatCard title="评论" :count="stats.commentCount" icon="chat" color="green" />
            <StatCard title="分类" :count="stats.categoryCount" icon="folder" color="purple" />
            <StatCard title="标签" :count="stats.tagCount" icon="tag" color="yellow" />
          </div>
          
          <RecentPosts v-if="recentPosts.length > 0" :posts="recentPosts" />
          <RecentComments v-if="recentComments.length > 0" :comments="recentComments" />
        </div>
        
        <!-- 文章管理 -->
        <div v-else-if="activeTab === 'posts'" class="tab-content">
          <PostsManager />
        </div>
        
        <!-- 评论管理 -->
        <div v-else-if="activeTab === 'comments'" class="tab-content">
          <CommentsManager />
        </div>
        
        <!-- 分类管理 -->
        <div v-else-if="activeTab === 'categories'" class="tab-content">
          <CategoriesManager />
        </div>
        
        <!-- 标签管理 -->
        <div v-else-if="activeTab === 'tags'" class="tab-content">
          <TagsManager />
        </div>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';
import StatCard from '../components/admin/StatCard.vue';
import RecentPosts from '../components/admin/RecentPosts.vue';
import RecentComments from '../components/admin/RecentComments.vue';
import PostsManager from '../components/admin/PostsManager.vue';
import CommentsManager from '../components/admin/CommentsManager.vue';
import CategoriesManager from '../components/admin/CategoriesManager.vue';
import TagsManager from '../components/admin/TagsManager.vue';
import api from '../api';

const router = useRouter();
const activeTab = ref('dashboard');
const stats = ref({
  postCount: 0,
  commentCount: 0,
  categoryCount: 0,
  tagCount: 0
});
const recentPosts = ref([]);
const recentComments = ref([]);

// 选项卡配置
const tabs = [
  { id: 'dashboard', name: '仪表盘' },
  { id: 'posts', name: '文章管理' },
  { id: 'comments', name: '评论管理' },
  { id: 'categories', name: '分类管理' },
  { id: 'tags', name: '标签管理' }
];

// 检查管理员权限
const checkAdminAccess = () => {
  const auth = useAuthStore();
  if (!auth.isLoggedIn) {
    router.push('/login?redirect=/admin');
    return;
  }
  if (!auth.isAdmin) {
    router.push('/');
  }
};

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await api.getAdminStats();
    stats.value = response;
  } catch (err) {
    console.error('获取统计数据失败:', err);
  }
};

// 加载最近文章
const loadRecentPosts = async () => {
  try {
    const response = await api.getPosts({ limit: 5 });
    recentPosts.value = Array.isArray(response) ? response.slice(0, 5) : 
                        (response.posts ? response.posts.slice(0, 5) : []);
  } catch (err) {
    console.error('获取最近文章失败:', err);
  }
};

// 加载最近评论
const loadRecentComments = async () => {
  try {
    const response = await api.getRecentComments(5);
    recentComments.value = response.comments || [];
  } catch (err) {
    console.error('获取最近评论失败:', err);
  }
};

onMounted(() => {
  checkAdminAccess();
  loadStats();
  loadRecentPosts();
  loadRecentComments();
});
</script>