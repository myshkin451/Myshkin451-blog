<template>
  <div class="min-h-screen bg-gray-50 dark:bg-[#050505] transition-colors duration-300">
    <Navbar />

    <header class="bg-white/80 dark:bg-[#111]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-16 z-40 transition-colors duration-300">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <h1 class="text-lg font-bold text-gray-900 dark:text-white flex items-center font-mono">
          <span class="w-2.5 h-2.5 rounded-full mr-3 animate-pulse" :class="article.published ? 'bg-green-500' : 'bg-yellow-500'"></span>
          {{ article.id ? 'EDIT POST' : 'NEW DRAFT' }}
        </h1>

        <div class="flex items-center space-x-3">
          <button
            @click="router.back()"
            class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            @click="saveArticle"
            :disabled="loading || !article.title"
            class="flex items-center px-6 py-2 bg-black dark:bg-white text-white dark:text-black font-bold text-sm rounded-lg hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/10"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ loading ? 'SAVING...' : 'PUBLISH' }}
          </button>
        </div>
      </div>
    </header>

    <div class="container mx-auto px-4 py-8">
      <div v-if="showDraftBanner" class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 text-sm font-mono flex items-center justify-between">
        <span>检测到未保存的草稿，是否恢复？</span>
        <div class="flex gap-2 ml-4">
          <button @click="restoreDraft" class="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition-colors">恢复</button>
          <button @click="dismissDraft" class="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">丢弃</button>
        </div>
      </div>

      <div v-if="error" class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm font-mono flex items-center">
        <span class="mr-2 text-lg">!</span> {{ error }}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <input
            v-model="article.title"
            type="text"
            placeholder="Enter Title Here..."
            class="w-full bg-transparent text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700 border-none focus:ring-0 px-0 leading-tight transition-colors duration-300"
          >

          <div class="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm min-h-[600px] overflow-hidden transition-colors duration-300">
            <div class="prose dark:prose-invert max-w-none p-2">
              <MarkdownEditor v-model="article.content" class="min-h-[600px]" />
            </div>
          </div>
        </div>

        <PostMetaPanel
          v-model="article"
          :categories="categories"
          :tags="tags"
        />
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';
import MarkdownEditor from '../components/MarkdownEditor.vue';
import PostMetaPanel from '../components/PostMetaPanel.vue';
import api from '../api';

const router = useRouter();
const route = useRoute();

const loading = ref(false);
const error = ref('');
const categories = ref([]);
const tags = ref([]);
const saved = ref(false);          // true after successful publish/save
const showDraftBanner = ref(false); // show "restore draft?" banner
const draftKey = ref('');

const article = reactive({
  id: null,
  title: '',
  content: '',
  excerpt: '',
  coverImage: '',
  categoryId: '',
  tagIds: [],
  published: false,
  createdAt: '',
});

// --- Draft auto-save ---
function getDraftKey() {
  return route.params.id ? `draft:edit:${route.params.id}` : 'draft:new';
}

function saveDraft() {
  if (!draftKey.value) return;
  const data = { title: article.title, content: article.content, excerpt: article.excerpt, coverImage: article.coverImage, categoryId: article.categoryId, tagIds: article.tagIds, published: article.published, createdAt: article.createdAt };
  localStorage.setItem(draftKey.value, JSON.stringify(data));
}

function clearDraft() {
  if (draftKey.value) localStorage.removeItem(draftKey.value);
}

function restoreDraft() {
  try {
    const raw = localStorage.getItem(draftKey.value);
    if (!raw) return;
    const data = JSON.parse(raw);
    Object.assign(article, data);
  } catch { /* ignore corrupt data */ }
  showDraftBanner.value = false;
}

function dismissDraft() {
  clearDraft();
  showDraftBanner.value = false;
}

let autoSaveTimer = null;
watch(
  () => ({ title: article.title, content: article.content, excerpt: article.excerpt, categoryId: article.categoryId, tagIds: [...article.tagIds], published: article.published }),
  () => {
    if (saved.value) return; // already published, don't overwrite draft
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(saveDraft, 3000);
  },
  { deep: true },
);

// --- Unsaved changes guard ---
const isDirty = ref(false);
watch(
  () => article.title + article.content,
  () => { isDirty.value = true; },
);

function beforeUnloadHandler(e) {
  if (isDirty.value && !saved.value) {
    e.preventDefault();
    e.returnValue = '';
  }
}

onBeforeRouteLeave(() => {
  if (isDirty.value && !saved.value) {
    return window.confirm('有未保存的更改，确定离开吗？');
  }
});

onBeforeUnmount(() => {
  clearTimeout(autoSaveTimer);
  window.removeEventListener('beforeunload', beforeUnloadHandler);
});

// --- Save / Publish ---
const saveArticle = async () => {
  if (!article.title.trim()) {
    error.value = 'Title is required';
    window.scrollTo(0, 0);
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const postData = {
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || null,
      coverImage: article.coverImage || null,
      categoryId: article.categoryId || null,
      tagIds: article.tagIds,
      status: article.published ? 'published' : 'draft',
      createdAt: article.createdAt ? new Date(article.createdAt).toISOString() : null,
    };

    let response;
    if (article.id) {
      response = await api.updatePost(article.id, postData);
    } else {
      response = await api.createPost(postData);
    }

    saved.value = true;
    clearDraft();

    const newId = response.id || (response.post && response.post.id) || (response.data && response.data.id);

    if (newId) {
      router.push(`/posts/${newId}`);
    } else {
      router.push('/admin');
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to save article.';
    window.scrollTo(0, 0);
  } finally {
    loading.value = false;
  }
};

const fetchArticle = async (id) => {
  try {
    const post = await api.getPostById(id);

    article.id = post.id;
    article.title = post.title;
    article.content = post.content;
    article.excerpt = post.excerpt || '';
    article.coverImage = post.coverImage || '';
    article.categoryId = post.categoryId || '';
    article.published = post.status === 'published';

    if (post.createdAt) {
      const date = new Date(post.createdAt);
      const offset = date.getTimezoneOffset() * 60000;
      article.createdAt = (new Date(date - offset)).toISOString().slice(0, 16);
    }

    if (post.tags && Array.isArray(post.tags)) {
      article.tagIds = post.tags.map(tag => tag.id);
    }
  } catch (err) {
    error.value = 'Failed to load article.';
  }
};

onMounted(async () => {
  const auth = useAuthStore();
  if (!auth.isAdmin) {
    router.push('/');
    return;
  }

  draftKey.value = getDraftKey();
  window.addEventListener('beforeunload', beforeUnloadHandler);

  const [cats, allTags] = await Promise.all([
    api.getCategories(),
    api.getTags(),
  ]);
  categories.value = cats;
  tags.value = allTags;

  if (route.params.id) {
    await fetchArticle(route.params.id);
  }

  // Check for saved draft after loading server data
  const hasDraft = localStorage.getItem(draftKey.value);
  if (hasDraft) {
    showDraftBanner.value = true;
  }

  // Reset dirty flag after initial data load
  isDirty.value = false;
});
</script>
