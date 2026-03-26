<template>
  <div>
    <Navbar />

    <div class="container mx-auto px-4 py-12">
      <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">注册账号</h1>

        <!-- 错误提示 -->
        <div
          v-if="error"
          class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
        >
          {{ error }}
        </div>

        <!-- 注册表单 -->
        <form class="space-y-4" @submit.prevent="handleRegister">
          <div>
            <label for="username" class="block text-gray-700 mb-1">用户名</label>
            <input
              id="username"
              v-model="username"
              type="text"
              required
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入用户名"
            />
          </div>

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
              placeholder="请输入密码（至少6位）"
            />
          </div>

          <div>
            <label for="confirmPassword" class="block text-gray-700 mb-1">确认密码</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请再次输入密码"
            />
          </div>

          <div>
            <button
              type="submit"
              :disabled="isSubmitting || !isFormValid"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {{ isSubmitting ? '注册中...' : '注册' }}
            </button>
          </div>
        </form>

        <div class="mt-6 text-center">
          <p class="text-gray-600">
            已有账号？
            <router-link to="/login" class="text-blue-600 hover:underline"> 立即登录 </router-link>
          </p>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';
import api from '../api';

// 表单数据
const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const isSubmitting = ref(false);

// 路由
const router = useRouter();

// 表单验证
const isFormValid = computed(() => {
  return (
    username.value.trim() &&
    email.value.trim() &&
    password.value.length >= 6 &&
    password.value === confirmPassword.value
  );
});

// 处理注册
const handleRegister = async () => {
  // 基本验证
  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致';
    return;
  }

  if (password.value.length < 6) {
    error.value = '密码长度不能少于6位';
    return;
  }

  error.value = '';
  isSubmitting.value = true;

  try {
    await api.register({
      username: username.value,
      email: email.value,
      password: password.value,
    });

    // 注册成功，重定向到首页
    router.push('/');
  } catch (err) {
    console.error('Registration error:', err);
    error.value = err.response?.data?.message || '注册失败，请稍后再试';
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
