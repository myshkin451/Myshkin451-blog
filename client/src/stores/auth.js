import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  /** Whether server-side token verification has been performed this session */
  const verified = ref(false);

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

  /**
   * Verify the token cookie with the server.
   * Called lazily on first navigation to a protected route.
   * Returns true if authenticated, false otherwise.
   */
  async function verifyAuth() {
    if (verified.value) return isLoggedIn.value;
    try {
      const { default: apiService } = await import('../api/index.js');
      const res = await apiService.checkAuth();
      const userData = res.data ?? res;
      setUser(userData);
      verified.value = true;
      return true;
    } catch {
      clearUser();
      verified.value = true;
      return false;
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
    verified.value = false;
    localStorage.removeItem('user');
  }

  return {
    user,
    verified,
    isLoggedIn,
    isAdmin,
    currentUserId,
    hydrate,
    verifyAuth,
    setUser,
    updateUser,
    clearUser,
  };
});
