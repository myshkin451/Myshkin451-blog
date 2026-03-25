<template>
  <div class="posts-manager">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold">文章管理</h2>
      <router-link to="/write" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        写文章
      </router-link>
    </div>
    
    <!-- 搜索和筛选 -->
    <div class="bg-white shadow rounded-lg p-4 mb-6">
      <div class="flex flex-wrap gap-4">
        <div class="flex-grow">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索文章标题..." 
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            @keyup.enter="searchPosts"
          />
        </div>
        <div>
          <select 
            v-model="statusFilter" 
            class="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="filterPosts"
          >
            <option value="">所有状态</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
          </select>
        </div>
        <div>
          <button 
            @click="searchPosts" 
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            搜索
          </button>
        </div>
      </div>
    </div>
    
    <!-- 文章列表 -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div v-if="loading" class="p-6 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-2 text-gray-600">加载中...</p>
      </div>
      
      <div v-else-if="posts.length === 0" class="p-6 text-center text-gray-500">
        没有找到文章
      </div>
      
      <div v-else>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">发布日期</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">阅读量</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="post in posts" :key="post.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ post.title }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                  {{ post.status === 'published' ? '已发布' : '草稿' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-500">{{ post.category?.name || '未分类' }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(post.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ post.viewCount || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <router-link :to="`/edit/${post.id}`" class="text-blue-600 hover:text-blue-900 mr-3">编辑</router-link>
                <a :href="`/posts/${post.id}`" target="_blank" class="text-green-600 hover:text-green-900 mr-3">查看</a>
                <button @click="confirmDelete(post)" class="text-red-600 hover:text-red-900">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api';

const posts = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const statusFilter = ref('');

// 获取文章列表
const fetchPosts = async () => {
  loading.value = true;
  try {
    const response = await api.getPosts();
    posts.value = Array.isArray(response) ? response : 
                 (response.posts ? response.posts : []);
  } catch (error) {
    console.error('获取文章失败:', error);
    posts.value = [];
  } finally {
    loading.value = false;
  }
};

// 搜索文章
const searchPosts = async () => {
  loading.value = true;
  try {
    const params = {};
    if (searchQuery.value) {
      params.query = searchQuery.value;
    }
    if (statusFilter.value) {
      params.status = statusFilter.value;
    }
    
    const response = await api.searchPosts(params);
    posts.value = response.posts || [];
  } catch (error) {
    console.error('搜索文章失败:', error);
    posts.value = [];
  } finally {
    loading.value = false;
  }
};

// 筛选文章
const filterPosts = () => {
  searchPosts();
};

// 确认删除
const confirmDelete = async (post) => {
  if (confirm(`确定要删除文章"${post.title}"吗？此操作不可恢复。`)) {
    try {
      await api.deletePost(post.id);
      alert('文章已成功删除');
      // 刷新列表
      fetchPosts();
    } catch (error) {
      console.error('删除文章失败:', error);
      alert('删除文章失败: ' + (error.response?.data?.message || '未知错误'));
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
    day: 'numeric'
  });
};

onMounted(() => {
  fetchPosts();
});
</script>