<template>
  <div>
    <Navbar />

    <div class="container mx-auto px-4 py-12">
      <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">登录</h1>

        <!-- 错误提示 -->
        <div
          v-if="error"
          class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
        >
          {{ error }}
        </div>

        <!-- 登录表单 -->
        <form class="space-y-4" @submit.prevent="handleLogin">
          <div>
            <label for="email" class="block text-gray-700 mb-1">邮箱</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入邮箱地址"
            />
          </div>

          <div>
            <label for="password" class="block text-gray-700 mb-1">密码</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入密码"
            />
          </div>

          <div>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {{ isSubmitting ? '登录中...' : '登录' }}
            </button>
          </div>
        </form>

        <div class="mt-6 text-center">
          <p class="text-gray-600">
            还没有账号？
            <router-link to="/register" class="text-blue-600 hover:underline">
              立即注册
            </router-link>
          </p>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';
import api from '../api';

// 表单数据
const email = ref('');
const password = ref('');
const error = ref('');
const isSubmitting = ref(false);

// 路由
const router = useRouter();
const route = useRoute();

// 处理登录
const handleLogin = async () => {
  error.value = '';
  isSubmitting.value = true;

  try {
    await api.login({
      email: email.value,
      password: password.value,
    });

    // 登录成功，重定向到上一页或首页
    const redirectPath = route.query.redirect || '/';
    router.push(redirectPath);
  } catch (err) {
    console.error('Login error:', err);
    error.value = err.response?.data?.message || '登录失败，请检查邮箱和密码';
  } finally {
    isSubmitting.value = false;
  }
};

// 检查是否已登录
onMounted(() => {
  if (useAuthStore().isLoggedIn) {
    router.push('/');
  }
});
</script>
