<template>
  <div class="search-bar">
    <form class="relative" @submit.prevent="handleSearch">
      <input
        v-model="searchQuery"
        type="text"
        class="w-full px-3 py-2 pl-10 pr-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="搜索文章..."
      />
      <button
        type="submit"
        class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const searchQuery = ref('');

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // 跳转到搜索结果页面，携带查询参数
    router.push({
      name: 'search-results',
      query: { q: searchQuery.value },
    });

    // 可选：清空搜索框
    // searchQuery.value = '';
  }
};
</script>
