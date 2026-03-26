import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import HomeView from '../views/HomeView.vue'; // 直接导入首页组件

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  // 临时路由 - 将来会替换为实际组件
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue')
  },
  // 动态路由
  {
    path: '/posts/:id',
    name: 'post-detail',
    component: () => import('../views/PostDetailView.vue')
  },
  {
    path: '/write',
    name: 'write-post',
    component: () => import('../views/EditorView.vue'),
    meta: { requiresAuth: true }
  },

  {
    path: '/edit/:id',
    name: 'edit-post',
    component: () => import('../views/EditorView.vue'),
    meta: { requiresAuth: true } 
  },
  {
    path: '/guestbook',
    name: 'guestbook',
    component: () => import('../views/PlaceholderView.vue') // 临时使用占位组件
  },

  {
    path: '/search',
    name: 'search-results',
    component: () => import('../views/SearchResultsView.vue')
  },

  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
    // 分类和标签详情页
  {
    path: '/categories',
    name: 'categories',
    component: () => import('../views/CategoriesView.vue')
  },
  {
    path: '/categories/:slug',
    name: 'category-detail',
    component: () => import('../views/CategoryDetailView.vue')
  },
  {
    path: '/tags',
    name: 'tags',
    component: () => import('../views/TagsView.vue')
  },
  {
    path: '/tags/:slug',
    name: 'tag-detail',
    component: () => import('../views/TagDetailView.vue')
  },

  // 管理后台路由
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },

  // 404 兜底路由（必须放在最后）
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 全局前置守卫
router.beforeEach(async (to) => {
  const auth = useAuthStore();
  const requiresAuth = to.matched.some(r => r.meta.requiresAuth);
  const requiresAdmin = to.matched.some(r => r.meta.requiresAdmin);
  const isGuestPage = to.name === 'login' || to.name === 'register';

  // 受保护路由：服务端校验 token（每 session 仅一次）
  if (requiresAuth) {
    const ok = await auth.verifyAuth();
    if (!ok) {
      return { path: '/login', query: { redirect: to.fullPath } };
    }
    if (requiresAdmin && !auth.isAdmin) {
      return { path: '/' };
    }
  }

  // 已登录用户不应访问登录/注册页
  if (isGuestPage && auth.isLoggedIn) {
    return { path: to.query.redirect || '/' };
  }
});

export default router;