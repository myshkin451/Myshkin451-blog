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
        
        <div class="space-y-6">
          
          <div class="bg-white dark:bg-[#111] rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
            <ImageUploader 
              v-model="article.coverImage" 
              label="Cover Image" 
            />
          </div>

          <div class="bg-white dark:bg-[#111] rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors duration-300">
            
            <div>
              <label class="block text-xs font-mono font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Excerpt</label>
              <textarea 
                v-model="article.excerpt" 
                rows="3" 
                class="w-full bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 dark:text-gray-300 transition-colors"
                placeholder="Brief description for SEO..."
              ></textarea>
            </div>

            <div>
              <label class="block text-xs font-mono font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Category</label>
              <div class="relative">
                <select 
                  v-model="article.categoryId" 
                  class="w-full bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 dark:text-gray-300 appearance-none py-2.5 px-3 transition-colors"
                >
                  <option value="" disabled>Select a category</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs font-mono font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Tags</label>
              <div class="flex flex-wrap gap-2 mb-3 min-h-[30px]">
                <span 
                  v-for="tagId in article.tagIds" 
                  :key="tagId" 
                  class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                >
                  #{{ findTagName(tagId) }}
                  <button @click="removeTag(tagId)" class="ml-1.5 hover:text-blue-900 dark:hover:text-white transition-colors">&times;</button>
                </span>
              </div>
              <div class="relative">
                <select 
                  v-model="selectedTag" 
                  @change="addTag"
                  class="w-full bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 dark:text-gray-300 appearance-none py-2.5 px-3 transition-colors"
                >
                  <option value="">+ Add Tag</option>
                  <option v-for="tag in availableTags" :key="tag.id" :value="tag.id">{{ tag.name }}</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                </div>
              </div>
            </div>

            <div class="pt-4 border-t border-gray-100 dark:border-gray-800">
              <label class="block text-xs font-mono font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
                Publish Date
              </label>
              <input 
                type="datetime-local" 
                v-model="article.createdAt"
                class="w-full bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 dark:text-gray-300 transition-colors"
              >
              <p class="text-[10px] text-gray-400 mt-1 font-mono">Leave blank for current time.</p>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <span class="text-sm font-bold text-gray-700 dark:text-gray-300 font-mono">PUBLISHED</span>
              <button 
                @click="article.published = !article.published"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                :class="article.published ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'"
              >
                <span 
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm"
                  :class="article.published ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';
import MarkdownEditor from '../components/MarkdownEditor.vue';
import ImageUploader from '../components/ImageUploader.vue';
import api from '../api';

const router = useRouter();
const route = useRoute();

// 状态
const loading = ref(false);
const error = ref('');
const categories = ref([]);
const tags = ref([]);
const selectedTag = ref('');

// 文章数据模型
const article = reactive({
  id: null,
  title: '',
  content: '',
  excerpt: '',
  coverImage: '',
  categoryId: '',
  tagIds: [],
  published: false,
  createdAt: '' // 用于绑定日期选择器
});

const availableTags = computed(() => {
  return tags.value.filter(tag => !article.tagIds.includes(tag.id));
});

const findTagName = (tagId) => {
  const tag = tags.value.find(t => t.id === tagId);
  return tag ? tag.name : 'Unknown';
};

const addTag = () => {
  if (selectedTag.value && !article.tagIds.includes(selectedTag.value)) {
    article.tagIds.push(selectedTag.value);
    selectedTag.value = '';
  }
};

const removeTag = (tagId) => {
  article.tagIds = article.tagIds.filter(id => id !== tagId);
};

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
      // 如果有值，转换为 ISO 格式传给后端；如果为空，传 null
      createdAt: article.createdAt ? new Date(article.createdAt).toISOString() : null
    };
    
    let response;
    if (article.id) {
      response = await api.updatePost(article.id, postData);
    } else {
      response = await api.createPost(postData);
    }
    
    // 修复 ID 获取逻辑：兼容 post 对象包裹的情况
    const newId = response.id || (response.post && response.post.id) || (response.data && response.data.id);
    
    if (newId) {
      router.push(`/posts/${newId}`);
    } else {
      console.error('无法获取文章ID，返回数据:', response);
      router.push('/admin'); // 失败回退到管理页
    }
    
  } catch (err) {
    console.error('Save failed:', err);
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
    
    // 时间格式化逻辑
    if (post.createdAt) {
      // 必须将 UTC 时间转换为本地时间的 YYYY-MM-DDTHH:mm 格式
      // 否则 datetime-local 输入框不会显示值
      const date = new Date(post.createdAt);
      const offset = date.getTimezoneOffset() * 60000; // 本地时区偏移量
      const localISOTime = (new Date(date - offset)).toISOString().slice(0, 16);
      article.createdAt = localISOTime;
    }

    if (post.tags && Array.isArray(post.tags)) {
      article.tagIds = post.tags.map(tag => tag.id);
    }
  } catch (err) {
    console.error('Fetch failed:', err);
    error.value = 'Failed to load article.';
  }
};

const fetchData = async () => {
  try {
    const [cats, allTags] = await Promise.all([
      api.getCategories(),
      api.getTags()
    ]);
    categories.value = cats;
    tags.value = allTags;
  } catch (err) {
    console.error('Init data failed:', err);
  }
};

onMounted(async () => {
  const auth = useAuthStore();
  if (!auth.isAdmin) {
    router.push('/');
    return;
  }

  await fetchData();

  if (route.params.id) {
    await fetchArticle(route.params.id);
  }
});
</script>