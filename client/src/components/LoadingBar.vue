<template>
  <transition name="bar">
    <div
      v-if="ui.globalLoading"
      class="fixed top-0 left-0 right-0 z-[9999] h-0.5"
    >
      <div class="h-full bg-blue-500 dark:bg-blue-400 animate-loading-bar rounded-r" />
    </div>
  </transition>
</template>

<script setup>
import { useUiStore } from '../stores/ui';
const ui = useUiStore();
</script>

<style scoped>
@keyframes loading-bar {
  0%   { width: 0%; margin-left: 0; }
  50%  { width: 60%; margin-left: 20%; }
  100% { width: 0%; margin-left: 100%; }
}
.animate-loading-bar {
  animation: loading-bar 1.2s ease-in-out infinite;
}
.bar-enter-active { transition: opacity 0.15s; }
.bar-leave-active { transition: opacity 0.4s; }
.bar-enter-from, .bar-leave-to { opacity: 0; }
</style>
