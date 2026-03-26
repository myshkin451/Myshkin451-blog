<template>
  <div class="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
    <h1 class="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">404</h1>
    <p class="text-xl text-gray-600 dark:text-gray-400 mb-8">页面不存在</p>
    <router-link
      to="/"
      class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      返回首页
    </router-link>
  </div>
</template>
