<template>
  <nav
    class="sticky top-0 z-50 w-full border-b border-zinc-200/70 bg-white/65 backdrop-blur
           dark:border-zinc-800/70 dark:bg-zinc-950/60"
  >
    <!-- scroll progress -->
    <div class="h-[2px] w-full bg-transparent">
      <div
        class="h-[2px] bg-gradient-to-r from-blue-600 via-sky-500 to-transparent"
        :style="{ width: `${scrollProgress}%` }"
      ></div>
    </div>

    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
      <!-- Brand -->
      <router-link to="/" class="group flex items-center gap-3">
        <div
          class="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm
                 transition-colors group-hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:group-hover:bg-zinc-900/40"
        >
          <span class="text-sm font-semibold tracking-tight">M</span>
        </div>

        <div class="hidden sm:block leading-tight">
          <div class="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Myshkin451</div>
          <div class="text-xs text-zinc-500 dark:text-zinc-400">backend · rag · tooling</div>
        </div>
      </router-link>

      <!-- Desktop -->
      <div class="hidden md:flex items-center gap-6">
        <div class="flex items-center gap-1">
          <router-link to="/" :class="linkClass('/')">首页</router-link>
          <router-link to="/categories" :class="linkClass('/categories')">分类</router-link>
          <router-link to="/tags" :class="linkClass('/tags')">标签</router-link>
          <router-link to="/guestbook" :class="linkClass('/guestbook')">留言板</router-link>

          <router-link v-if="isAdmin" to="/admin" :class="linkClass('/admin')">后台</router-link>
          <router-link v-if="isAdmin" to="/write" :class="linkClass('/write')">写文章</router-link>
        </div>

        <div class="flex items-center gap-3">
          <div class="hidden lg:block w-[260px]">
            <SearchBar />
          </div>

          <button
            @click="toggleTheme"
            class="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 bg-white/60 text-zinc-700
                   transition-colors hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200 dark:hover:bg-zinc-900/70"
            aria-label="Toggle theme"
          >
            <svg v-if="isDark" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 3v2"></path><path d="M12 19v2"></path>
              <path d="M4.22 4.22l1.42 1.42"></path><path d="M18.36 18.36l1.42 1.42"></path>
              <path d="M3 12h2"></path><path d="M19 12h2"></path>
              <path d="M4.22 19.78l1.42-1.42"></path><path d="M18.36 5.64l1.42-1.42"></path>
              <circle cx="12" cy="12" r="4"></circle>
            </svg>
            <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8Z"></path>
            </svg>
          </button>

          <div v-if="isLoggedIn" class="relative" ref="profileMenuRef">
            <button
              @click="toggleProfileMenu"
              class="flex items-center gap-2 rounded-full border border-zinc-200 bg-white/60 pl-1 pr-3 py-1.5
                     transition-colors hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/70"
            >
              <img
                :src="userAvatar || '/img/default-avatar.png'"
                class="h-7 w-7 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 bg-zinc-100"
                alt="Avatar"
              />
              <span class="max-w-[110px] truncate text-sm text-zinc-700 dark:text-zinc-200">
                {{ userName }}
              </span>
              <svg class="h-4 w-4 text-zinc-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>

            <div
              v-if="showProfileMenu"
              class="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg
                     dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div class="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <p class="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{{ userName }}</p>
                <p class="text-xs text-zinc-500 dark:text-zinc-400">Account</p>
              </div>

              <router-link to="/profile" class="menu-item">个人资料</router-link>
              <router-link to="/my-comments" class="menu-item">我的评论</router-link>
              <router-link v-if="isAdmin" to="/write" class="menu-item">写文章</router-link>
              <router-link v-if="isAdmin" to="/admin" class="menu-item">管理后台</router-link>
              <button @click="logout" class="menu-item w-full text-left text-red-600 dark:text-red-400">退出登录</button>
            </div>
          </div>

          <div v-else class="flex items-center gap-2">
            <router-link to="/login" class="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
              登录
            </router-link>
            <router-link
              to="/register"
              class="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 shadow-sm
                     transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              注册
            </router-link>
          </div>
        </div>
      </div>

      <!-- Mobile toggle -->
      <button
        class="md:hidden grid h-10 w-10 place-items-center rounded-full border border-zinc-200 bg-white/60 text-zinc-700
               transition-colors hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200 dark:hover:bg-zinc-900/70"
        @click="toggleMobileMenu"
        aria-label="Toggle menu"
      >
        <svg v-if="!showMobileMenu" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 6h16"></path><path d="M4 12h16"></path><path d="M4 18h16"></path>
        </svg>
        <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6 6 18"></path><path d="M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <!-- Mobile panel -->
    <div
      v-if="showMobileMenu"
      class="md:hidden border-t border-zinc-200/70 bg-white/90 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/90"
    >
      <div class="mx-auto max-w-6xl px-6 py-4 space-y-4">
        <SearchBar />

        <div class="flex flex-col gap-1">
          <router-link to="/" :class="mobileLinkClass('/')" @click="closeMobileMenu">首页</router-link>
          <router-link to="/categories" :class="mobileLinkClass('/categories')" @click="closeMobileMenu">分类</router-link>
          <router-link to="/tags" :class="mobileLinkClass('/tags')" @click="closeMobileMenu">标签</router-link>
          <router-link to="/guestbook" :class="mobileLinkClass('/guestbook')" @click="closeMobileMenu">留言板</router-link>

          <router-link v-if="isAdmin" to="/write" :class="mobileLinkClass('/write')" @click="closeMobileMenu">写文章</router-link>
          <router-link v-if="isAdmin" to="/admin" :class="mobileLinkClass('/admin')" @click="closeMobileMenu">管理后台</router-link>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-zinc-200/70 dark:border-zinc-800/70">
          <button
            @click="toggleTheme"
            class="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800
                   transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            <span class="text-xs text-zinc-500 dark:text-zinc-400">Theme</span>
            <span class="font-medium">{{ isDark ? 'Dark' : 'Light' }}</span>
          </button>

          <div v-if="!isLoggedIn" class="flex items-center gap-3">
            <router-link to="/login" class="text-sm text-zinc-600 dark:text-zinc-300" @click="closeMobileMenu">登录</router-link>
            <router-link to="/register" class="text-sm font-medium text-zinc-900 dark:text-zinc-50" @click="closeMobileMenu">
              注册
            </router-link>
          </div>

          <button v-else @click="logout" class="text-sm font-medium text-red-600 dark:text-red-400">退出登录</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/auth';
import { useUiStore } from '../stores/ui';
import SearchBar from './SearchBar.vue';

const router = useRouter();
const route = useRoute();

const authStore = useAuthStore();
const uiStore = useUiStore();

const { isLoggedIn, isAdmin, user } = storeToRefs(authStore);
const { isDark } = storeToRefs(uiStore);

const userName = computed(() => user.value?.username || '用户');
const userAvatar = computed(() => user.value?.avatar || null);

const showMobileMenu = ref(false);
const showProfileMenu = ref(false);
const profileMenuRef = ref(null);
const scrollProgress = ref(0);

const navLinkBase = 'inline-flex items-center rounded-md px-2 py-1.5 text-sm transition-colors';

const isActive = (path) => {
  if (path === '/') return route.path === '/';
  return route.path === path || route.path.startsWith(path + '/');
};

const linkClass = (path) => {
  const active = isActive(path);
  return [
    navLinkBase,
    active
      ? 'text-zinc-900 dark:text-zinc-50'
      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50'
  ].join(' ');
};

const mobileLinkClass = (path) => {
  const active = isActive(path);
  return [
    'rounded-lg px-3 py-2 text-sm transition-colors',
    active
      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900/60 dark:text-zinc-50'
      : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900/60'
  ].join(' ');
};

const toggleTheme = () => uiStore.toggleTheme();

const logout = async () => {
  const { logout: doLogout } = await import('../api/auth.js');
  await doLogout();

  showProfileMenu.value = false;
  showMobileMenu.value = false;
  router.push('/');
};

const toggleMobileMenu = () => { showMobileMenu.value = !showMobileMenu.value; };
const closeMobileMenu = () => { showMobileMenu.value = false; };
const toggleProfileMenu = () => { showProfileMenu.value = !showProfileMenu.value; };

const handleClickOutside = (event) => {
  if (profileMenuRef.value && !profileMenuRef.value.contains(event.target)) {
    showProfileMenu.value = false;
  }
};

const handleScroll = () => {
  const doc = document.documentElement;
  const scrollTop = doc.scrollTop || document.body.scrollTop;
  const scrollHeight = doc.scrollHeight - doc.clientHeight;
  const p = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  scrollProgress.value = Math.min(100, Math.max(0, p));
};

watch(
  () => route.fullPath,
  () => {
    showProfileMenu.value = false;
    showMobileMenu.value = false;
  }
);

onMounted(() => {
  handleScroll();
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.menu-item {
  display: block;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  color: rgb(63 63 70);
  transition: background-color 150ms ease, color 150ms ease;
}
.menu-item:hover { background: rgb(244 244 245); }
:global(.dark) .menu-item { color: rgb(228 228 231); }
:global(.dark) .menu-item:hover { background: rgba(24, 24, 27, 0.7); }
</style>
