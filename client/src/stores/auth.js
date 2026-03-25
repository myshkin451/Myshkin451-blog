import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);

  const isLoggedIn = computed(() => !!user.value);
  const isAdmin = computed(() =>
    user.value?.isAdmin === true || user.value?.role === 'admin'
  );
  const currentUserId = computed(() => user.value?.id ?? null);

  /** Restore user from localStorage on app init */
  function hydrate() {
    try {
      const raw = localStorage.getItem('user');
      if (raw) user.value = JSON.parse(raw);
    } catch {
      localStorage.removeItem('user');
    }
  }

  /** Called after successful login / register API response */
  function setUser(userData) {
    user.value = userData;
    localStorage.setItem('user', JSON.stringify(userData));
  }

  /** Update partial user fields (e.g. after profile edit or avatar upload) */
  function updateUser(partial) {
    if (!user.value) return;
    user.value = { ...user.value, ...partial };
    localStorage.setItem('user', JSON.stringify(user.value));
  }

  function clearUser() {
    user.value = null;
    localStorage.removeItem('user');
  }

  return {
    user,
    isLoggedIn,
    isAdmin,
    currentUserId,
    hydrate,
    setUser,
    updateUser,
    clearUser,
  };
});
