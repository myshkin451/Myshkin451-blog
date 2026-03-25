<template>
  <div>
    <Navbar />
    
    <div class="container mx-auto px-4 py-8">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p class="text-red-600 mb-4">{{ error }}</p>
        <router-link to="/tags" class="text-blue-600 hover:underline">
          查看所有标签
        </router-link>
      </div>
      
      <!-- 标签内容 -->
      <div v-else-if="tag" class="flex flex-col md:flex-row">
        <!-- 左侧主内容区 -->
        <div class="w-full md:w-2/3 md:pr-6">
          <!-- 标签信息 -->
          <div class="mb-8 bg-white rounded-lg shadow-sm border p-6">
            <h1 class="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded mr-2">#</span>
              {{ tag.name }}
            </h1>
            <div class="flex items-center text-sm text-gray-500">
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                文章数量: {{ tag.posts?.length || 0 }}
              </span>
            </div>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-800 mb-6">标签文章</h2>
          
          <!-- 文章列表 -->
          <div v-if="tag.posts && tag.posts.length > 0" class="space-y-6">
            <ArticleCard 
              v-for="post in tag.posts" 
              :key="post.id" 
              :article="post" 
            />
          </div>
          
          <!-- 无文章提示 -->
          <div v-else class="bg-gray-50 rounded-lg p-8 text-center">
            <p class="text-gray-600">该标签下暂无文章</p>
            <router-link to="/" class="text-blue-600 hover:underline mt-2 inline-block">
              返回首页
            </router-link>
          </div>
        </div>
        
        <!-- 右侧侧边栏 -->
        <div class="w-full md:w-1/3 mt-8 md:mt-0">
          <!-- 相关标签 -->
          <div class="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <h2 class="text-xl font-bold text-gray-800 mb-4">所有标签</h2>
            <div v-if="loadingTags" class="text-center py-4">
              <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            </div>
            <div v-else-if="tags.length === 0" class="text-gray-500 text-center py-2">
              暂无标签
            </div>
            <div v-else class="flex flex-wrap gap-2">
              <router-link 
                v-for="t in tags" 
                :key="t.id" 
                :to="`/tags/${t.slug}`"
                class="inline-block px-3 py-1 rounded text-sm transition duration-200"
                :class="t.id === tag.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              >
                {{ t.name }}
              </router-link>
            </div>
          </div>
          
          <!-- 热门分类 -->
          <div class="bg-white rounded-lg shadow-sm border p-4">
            <h2 class="text-xl font-bold text-gray-800 mb-4">热门分类</h2>
            <div v-if="loadingCategories" class="text-center py-4">
              <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            </div>
            <div v-else-if="categories.length === 0" class="text-gray-500 text-center py-2">
              暂无分类
            </div>
            <div v-else class="space-y-2">
              <router-link 
                v-for="category in categories" 
                :key="category.id" 
                :to="`/categories/${category.slug}`"
                class="block px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition duration-200"
              >
                {{ category.name }}
                <span class="text-gray-500 text-sm ml-1">({{ category.postCount || 0 }})</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 标签不存在 -->
      <div v-else class="bg-gray-50 rounded-lg p-8 text-center">
        <p class="text-gray-600 mb-4">标签不存在或已被删除</p>
        <router-link to="/tags" class="text-blue-600 hover:underline">
          查看所有标签
        </router-link>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';
import ArticleCard from '../components/ArticleCard.vue';
import api from '../api';

const route = useRoute();

// 状态
const loading = ref(true);
const error = ref(null);
const tag = ref(null);
const categories = ref([]);
const tags = ref([]);
const loadingCategories = ref(true);
const loadingTags = ref(true);

// 获取标签详情
const fetchTagDetails = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const slug = route.params.slug;
    if (!slug) {
      error.value = '无效的标签参数';
      return;
    }
    
    // 清理旧数据
    tag.value = null;
    
    // 获取标签详情
    const data = await api.getTagBySlug(slug);
    
    if (!data) {
      error.value = '获取标签详情失败';
      return;
    }
    
    tag.value = data;
    
    // 确保posts数组存在
    if (!tag.value.posts) {
      tag.value.posts = [];
    }
    
    // 确保每篇文章有必要的属性
    tag.value.posts.forEach(post => {
      // 如果没有摘要，从内容生成摘要
      if (!post.excerpt && post.content) {
        post.excerpt = post.content.substring(0, 150) + '...';
      }
      
      // 如果没有作者信息，提供默认值
      if (!post.author) {
        post.author = { username: '未知作者', avatar: null };
      }
      
      // 确保标签数组存在
      if (!post.tags) {
        post.tags = [];
      }
    });
    
  } catch (err) {
    console.error('获取标签详情失败:', err);
    error.value = '获取标签详情失败，请稍后重试';
  } finally {
    loading.value = false;
  }
};

// 获取所有标签
const fetchTags = async () => {
  try {
    loadingTags.value = true;
    
    const data = await api.getTags();
    tags.value = data || [];
    
  } catch (err) {
    console.error('获取所有标签失败:', err);
    tags.value = [];
  } finally {
    loadingTags.value = false;
  }
};

// 获取所有分类
const fetchCategories = async () => {
  try {
    loadingCategories.value = true;
    
    const data = await api.getCategories();
    categories.value = data || [];
    
  } catch (err) {
    console.error('获取所有分类失败:', err);
    categories.value = [];
  } finally {
    loadingCategories.value = false;
  }
};

// 监听路由参数变化
watch(() => route.params.slug, (newSlug) => {
  if (newSlug) {
    fetchTagDetails();
  }
});

// 页面加载时获取数据
onMounted(() => {
  fetchTagDetails();
  fetchCategories();
  fetchTags();
});
</script>