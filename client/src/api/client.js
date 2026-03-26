import axios from 'axios';
import { useUiStore } from '../stores/ui';

function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : '';
}

const client = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// --- Request: CSRF + loading ---
client.interceptors.request.use(async (config) => {
  // Skip loading indicator for silent background requests (e.g. token check)
  if (!config._silent) {
    useUiStore().startLoading();
  }
  if (config.method !== 'get') {
    let token = getCsrfToken();
    if (!token) {
      await axios.get('/api/health', { withCredentials: true });
      token = getCsrfToken();
    }
    config.headers['x-csrf-token'] = token;
  }
  return config;
});

// --- Response: stop loading + 401 redirect + error toast ---
client.interceptors.response.use(
  (response) => {
    if (!response.config._silent) {
      useUiStore().stopLoading();
    }
    return response;
  },
  async (error) => {
    if (!error.config?._silent) {
      useUiStore().stopLoading();
    }

    // 401: clear auth state & redirect to login
    if (error.response?.status === 401) {
      const { useAuthStore } = await import('../stores/auth');
      const auth = useAuthStore();
      if (auth.isLoggedIn) {
        auth.clearUser();
        const { default: router } = await import('../router/index.js');
        router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } });
      }
    }
    // Network error toast (no response = network failure)
    else if (!error.response) {
      useUiStore().addToast('error', '网络连接失败，请检查网络');
    }

    return Promise.reject(error);
  },
);

export default client;
