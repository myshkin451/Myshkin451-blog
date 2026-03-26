import axios from 'axios';

function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : '';
}

const client = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// CSRF: 非 GET 请求自动附加 token
client.interceptors.request.use(async (config) => {
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

// 401 自动清除登录态并跳转
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { useAuthStore } = await import('../stores/auth');
      const auth = useAuthStore();
      if (auth.isLoggedIn) {
        auth.clearUser();
        const { default: router } = await import('../router/index.js');
        router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } });
      }
    }
    return Promise.reject(error);
  },
);

export default client;
