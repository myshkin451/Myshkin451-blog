import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

let toastId = 0;

export const useUiStore = defineStore('ui', () => {
  const isDark = ref(false);

  // --- Loading ---
  const pendingRequests = ref(0);
  const globalLoading = computed(() => pendingRequests.value > 0);

  function startLoading() { pendingRequests.value++; }
  function stopLoading() { pendingRequests.value = Math.max(0, pendingRequests.value - 1); }

  // --- Toast ---
  const toasts = ref([]);

  /**
   * @param {'success'|'error'|'info'} type
   * @param {string} message
   * @param {number} duration — ms, 0 = manual dismiss
   */
  function addToast(type, message, duration = 3000) {
    const id = ++toastId;
    toasts.value.push({ id, type, message });
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }

  // --- Theme ---
  function hydrate() {
    const saved = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (saved === 'dark' || (!saved && systemDark)) {
      isDark.value = true;
      document.documentElement.classList.add('dark');
    } else {
      isDark.value = false;
      document.documentElement.classList.remove('dark');
    }
  }

  function toggleTheme() {
    isDark.value = !isDark.value;
    if (isDark.value) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  return {
    isDark, globalLoading, pendingRequests,
    startLoading, stopLoading,
    toasts, addToast, removeToast,
    hydrate, toggleTheme,
  };
});
