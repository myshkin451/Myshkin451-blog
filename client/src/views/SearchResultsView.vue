<template>
  <div>
    <Navbar />

    <div class="container mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">搜索结果: "{{ query }}"</h1>

      <!-- 搜索筛选器 -->
      <div class="mb-6 p-4 bg-white rounded-lg shadow-sm border">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex-grow">
            <input
              v-model="searchQuery"
              type="text"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="搜索文章..."
              @keyup.enter="handleSearch"
            />
          </div>
          <button
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            @click="handleSearch"
          >
            搜索
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
        ></div>
      </div>

      <!-- 搜索结果 -->
      <div v-else>
        <!-- 无结果提示 -->
        <div v-if="posts.length === 0" class="bg-gray-50 rounded-lg p-8 text-center">
          <p class="text-gray-600 mb-4">未找到与 "{{ query }}" 相关的文章</p>
          <router-link to="/" class="text-blue-600 hover:underline"> 返回首页 </router-link>
        </div>

        <!-- 文章列表 -->
        <div v-else class="space-y-6">
          <ArticleCard v-for="post in posts" :key="post.id" :article="post" />

          <!-- 分页控件 -->
          <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';
import ArticleCard from '../components/ArticleCard.vue';
import Pagination from '../components/Pagination.vue';
import api from '../api';

const route = useRoute();
const router = useRouter();

// 状态变量
const loading = ref(true);
const posts = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const totalResults = ref(0);

// 计算属性
const query = computed(() => route.query.q || '');

// 方法
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // 更新URL参数并重置页码
    router.push({
      name: 'search-results',
      query: {
        q: searchQuery.value,
        page: 1,
      },
    });
  }
};

const handlePageChange = (page) => {
  // 更新页码参数但保留搜索关键词
  router.push({
    name: 'search-results',
    query: {
      ...route.query,
      page,
    },
  });

  // 滚动到顶部
  window.scrollTo(0, 0);
};

const fetchSearchResults = async () => {
  if (!query.value) {
    posts.value = [];
    loading.value = false;
    return;
  }

  loading.value = true;

  try {
    const page = parseInt(route.query.page) || 1;

    const response = await api.searchPosts({
      query: query.value,
      page,
      limit: 10,
    });

    posts.value = response.posts || [];
    currentPage.value = response.pagination?.currentPage || 1;
    totalPages.value = response.pagination?.totalPages || 1;
    totalResults.value = response.pagination?.total || 0;

    // 同步搜索框文本
    searchQuery.value = query.value;
  } catch (error) {
    console.error('获取搜索结果失败:', error);
    posts.value = [];
  } finally {
    loading.value = false;
  }
};

// 监听路由变化，重新获取搜索结果
watch(
  () => route.query,
  () => {
    fetchSearchResults();
  },
  { deep: true },
);

// 组件挂载时获取数据
onMounted(() => {
  fetchSearchResults();
});
</script>
