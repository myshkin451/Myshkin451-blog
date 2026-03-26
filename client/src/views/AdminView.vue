<template>
  <div class="admin-view">
    <Navbar />

    <div class="container mx-auto px-4 py-8">
      <div class="bg-white shadow-sm rounded-lg border p-6 mb-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">管理后台</h1>

        <!-- 导航选项卡 -->
        <div class="mb-6">
          <div class="border-b">
            <nav class="flex -mb-px">
              <router-link
                v-for="tab in tabs"
                :key="tab.to"
                :to="tab.to"
                class="py-2 px-4 mr-2 font-medium text-sm leading-5 focus:outline-none"
                :class="isActive(tab.to) ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'"
              >
                {{ tab.name }}
              </router-link>
            </nav>
          </div>
        </div>

        <!-- 子路由内容 -->
        <router-view />
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';

const route = useRoute();

const tabs = [
  { to: '/admin', name: '仪表盘' },
  { to: '/admin/posts', name: '文章管理' },
  { to: '/admin/comments', name: '评论管理' },
  { to: '/admin/categories', name: '分类管理' },
  { to: '/admin/tags', name: '标签管理' },
];

const isActive = (to) => {
  if (to === '/admin') return route.path === '/admin';
  return route.path.startsWith(to);
};
</script>
