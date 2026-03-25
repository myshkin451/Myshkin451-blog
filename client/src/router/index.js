import { createRouter, createWebHistory } from 'vue-router';
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
}
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 检查路由是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查用户是否已登录
    const user = localStorage.getItem('user');
    if (!user) {
      // 未登录，重定向到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath } // 保存原目标路径
      });
    } else {
      // 已登录，继续
      
      // 检查是否需要管理员权限
      if (to.matched.some(record => record.meta.requiresAdmin)) {
        // 获取用户信息
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.isAdmin) {
            // 是管理员，允许访问
            next();
          } else {
            // 不是管理员，重定向到首页
            next({ path: '/' });
          }
        } else {
          // 无法确定用户角色，重定向到首页
          next({ path: '/' });
        }
      } else {
        // 不需要管理员权限，允许访问
        next();
      }
    }
  } else {
    // 不需要认证的路由
    next();
  }
});

export default router;