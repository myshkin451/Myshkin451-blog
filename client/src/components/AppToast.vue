<template>
  <teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <transition-group name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto max-w-sm w-full px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-start gap-2 backdrop-blur-sm"
          :class="classes[toast.type]"
        >
          <span class="shrink-0 text-base leading-none mt-0.5">{{ icons[toast.type] }}</span>
          <span class="flex-1 break-words">{{ toast.message }}</span>
          <button
            class="shrink-0 opacity-60 hover:opacity-100 transition-opacity ml-2"
            @click="ui.removeToast(toast.id)"
          >
            &times;
          </button>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup>
import { computed } from 'vue';
import { useUiStore } from '../stores/ui';

const ui = useUiStore();
const toasts = computed(() => ui.toasts);

const classes = {
  success: 'bg-green-600/90 text-white',
  error: 'bg-red-600/90 text-white',
  info: 'bg-gray-800/90 dark:bg-gray-200/90 text-white dark:text-gray-900',
};

const icons = {
  success: '\u2713',
  error: '!',
  info: 'i',
};
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
.toast-move {
  transition: transform 0.2s ease;
}
</style>
