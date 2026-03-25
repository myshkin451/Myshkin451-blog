<template>
  <div
    ref="rootRef"
    class="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50
           selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-950"
    @mousemove="onMouseMove"
  >
    <Navbar />

    <!-- Background: grid + noise + vignette + subtle spotlight -->
    <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <!-- subtle grid -->
      <div
        class="absolute inset-0 opacity-[0.55] dark:opacity-[0.22]
               [background-image:linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)]
               [background-size:56px_56px]"
      ></div>

      <!-- noise -->
      <div
        class="absolute inset-0 opacity-[0.06] dark:opacity-[0.08]"
        style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%270 0 220 220%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.8%27 numOctaves=%272%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27220%27 height=%27220%27 filter=%27url(%23n)%27 opacity=%270.7%27/%3E%3C/svg%3E');"
      ></div>

      <!-- vignette -->
      <div
        class="absolute inset-0
               [background-image:radial-gradient(closest-side_at_50%_0%,rgba(0,0,0,0.10),transparent_55%)]
               dark:[background-image:radial-gradient(closest-side_at_50%_0%,rgba(255,255,255,0.08),transparent_55%)]"
      ></div>

      <!-- spotlight (mouse follow) -->
      <div class="absolute inset-0 spotlight"></div>
    </div>

    <main class="relative z-10 mx-auto max-w-6xl px-6 py-12 md:py-16">
      <!-- Hero -->
      <header class="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-end">
        <div class="md:col-span-8">
          <p class="text-xs uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
            Myshkin451 · Backend & AI Apps
          </p>

          <h1 class="mt-4 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            把后端做扎实，<br class="hidden md:block" />
            把 AI 应用做成“能用的产品”。
          </h1>

          <p class="mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
            我写 FastAPI / Redis / Docker，也写 RAG 的检索、评估与工程化落地。这里是我的笔记与作品陈列。
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <a
              href="#posts"
              class="btn-primary"
            >
              阅读文章
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14"></path>
                <path d="m19 12-7 7-7-7"></path>
              </svg>
            </a>

            <a
              href="#projects"
              class="btn-ghost"
            >
              查看作品
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 3h7v7"></path>
                <path d="M10 14 21 3"></path>
                <path d="M21 14v7H3V3h7"></path>
              </svg>
            </a>

            <a
              href="https://github.com/Achernar-Eridani"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-ghost"
            >
              GitHub
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.866-.013-1.7-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
                  clip-rule="evenodd"
                />
              </svg>
            </a>

            <router-link v-if="isAdmin" to="/write" class="btn-ghost">
              新建文章 <span class="text-zinc-400">+</span>
            </router-link>
          </div>

          <!-- “展示感”来自信息结构，而不是口号 -->
          <div class="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div class="pill">
              <span class="pill-k">Focus</span>
              <span class="pill-v">Backend reliability</span>
            </div>
            <div class="pill">
              <span class="pill-k">Interest</span>
              <span class="pill-v">RAG engineering</span>
            </div>
            <div class="pill">
              <span class="pill-k">Style</span>
              <span class="pill-v">Pragmatic & shipped</span>
            </div>
          </div>
        </div>

        <!-- Side card -->
        <div class="md:col-span-4">
          <div class="panel">
            <p class="text-xs uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">Now</p>
            <p class="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
              追求 “可维护、低延迟、可评估” 的 AI 应用：缓存策略、索引构建、以及更稳定的 API 形态。
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
              <span class="chip">FastAPI</span>
              <span class="chip">Redis</span>
              <span class="chip chip-accent">RAG</span>
              <span class="chip">Docker</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Featured Projects -->
      <section id="projects" class="mt-14 scroll-mt-24">
        <div class="flex items-end justify-between gap-6">
          <div>
            <h2 class="text-2xl md:text-3xl font-semibold tracking-tight">Featured Projects</h2>
            <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              两个代表作：一个偏 AI 工具链，一个偏全栈交付。
            </p>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <a
            class="project-card"
            href="https://marketplace.visualstudio.com/items?itemName=myshkin451.code-rag-assistant"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="project-top">
              <div class="project-icon">⌘</div>
              <div class="min-w-0">
                <div class="project-title">CodeRAG-Agent</div>
                <div class="project-sub">VS Code Extension · AST-aware code RAG</div>
              </div>
              <div class="project-cta">Open →</div>
            </div>
            <p class="project-desc">
              把代码检索做得更“工程”：索引构建、检索链路、以及更可控的上下文拼装。
            </p>
            <div class="project-tags">
              <span class="tag">Python</span><span class="tag">RAG</span><span class="tag">Tooling</span>
            </div>
          </a>

          <a
            class="project-card"
            href="https://github.com/Achernar-Eridani"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="project-top">
              <div class="project-icon">✶</div>
              <div class="min-w-0">
                <div class="project-title">Myshkin451 Blog CMS</div>
                <div class="project-sub">Full-stack · writing system</div>
              </div>
              <div class="project-cta">GitHub →</div>
            </div>
            <p class="project-desc">
              你的文章系统本体：内容、分类、标签、评论、部署与 CI/CD，一套走完。
            </p>
            <div class="project-tags">
              <span class="tag">Vue</span><span class="tag">Node</span><span class="tag">Docker</span>
            </div>
          </a>
        </div>
      </section>

      <!-- Topics + Toolbox -->
      <section class="mt-12 grid grid-cols-1 gap-6 md:grid-cols-12">
        <div class="panel md:col-span-7">
          <div class="flex items-end justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold tracking-tight">Toolbox</h2>
              <p class="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                不用“代码块装饰”，用清晰的信息层级展示。
              </p>
            </div>
          </div>

          <div class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <p class="text-xs uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">Backend</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <span class="chip">Python</span><span class="chip">FastAPI</span><span class="chip">MySQL</span>
                <span class="chip">Redis</span><span class="chip">Docker</span>
              </div>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">AI Apps</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <span class="chip chip-accent">RAG</span><span class="chip">Hybrid Search</span><span class="chip">Rerank</span>
                <span class="chip">Eval</span>
              </div>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">Frontend</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <span class="chip">Vue 3</span><span class="chip">Tailwind</span><span class="chip">Vite</span>
              </div>
            </div>
          </div>
        </div>

        <div class="panel md:col-span-5">
          <h2 class="text-lg font-semibold tracking-tight">Topics</h2>
          <p class="mt-1 text-sm text-zinc-600 dark:text-zinc-300">按分类快速浏览。</p>

          <div class="mt-4 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
            <div class="grid grid-cols-2 gap-2">
              <router-link
                v-for="cat in categories"
                :key="cat.id"
                :to="`/categories/${cat.slug || cat.id}`"
                class="topic-item"
              >
                <span class="truncate"># {{ cat.name }}</span>
              </router-link>
            </div>
          </div>
        </div>
      </section>

      <!-- Posts -->
      <section id="posts" class="mt-16 scroll-mt-24">
        <div class="flex items-end justify-between gap-6">
          <div>
            <h2 class="text-2xl md:text-3xl font-semibold tracking-tight">Latest Writing</h2>
            <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              写作是为了把复杂系统讲清楚，也为了留下可复用的结论。
            </p>
          </div>
        </div>

        <div v-if="loading" class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="n in 6"
            :key="n"
            class="h-[320px] rounded-2xl border border-zinc-200/60 bg-white/60 animate-pulse
                   dark:border-zinc-800/60 dark:bg-zinc-900/30"
          ></div>
        </div>

        <div v-else-if="posts.length === 0" class="mt-10 panel p-10 text-center">
          <p class="text-zinc-600 dark:text-zinc-300">暂时还没有文章。</p>
        </div>

        <div v-else class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ArticleCardV2 v-for="post in posts" :key="post.id" :article="post" />
        </div>

        <div class="mt-14 flex justify-center">
          <Pagination
            v-if="posts.length > 0"
            :current-page="currentPage"
            :total-pages="totalPages"
            @page-change="handlePageChange"
          />
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/auth';
import Navbar from '../components/Navbar.vue';
import ArticleCardV2 from '../components/ArticleCardV2.vue';
import Pagination from '../components/Pagination.vue';
import Footer from '../components/Footer.vue';
import api from '../api';

const rootRef = ref(null);

const posts = ref([]);
const loading = ref(true);
const currentPage = ref(1);
const totalPages = ref(1);
const categories = ref([]);
const { isAdmin } = storeToRefs(useAuthStore());

const onMouseMove = (e) => {
  const el = rootRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
  el.style.setProperty('--my', `${e.clientY - rect.top}px`);
};

const fetchPosts = async (page = 1) => {
  try {
    loading.value = true;
    const response = await api.getPosts({ page, limit: 9 });

    if (Array.isArray(response)) {
      posts.value = response;
    } else if (response.posts) {
      posts.value = response.posts;
      currentPage.value = response.pagination?.currentPage || 1;
      totalPages.value = response.pagination?.totalPages || 1;
    } else if (response.data) {
      posts.value = response.data;
    } else {
      posts.value = response || [];
    }
  } catch (error) {
    posts.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    categories.value = await api.getCategories();
  } catch (error) {}
};

const handlePageChange = (page) => {
  fetchPosts(page);
  const postsSection = document.getElementById('posts');
  if (postsSection) postsSection.scrollIntoView({ behavior: 'smooth' });
};

onMounted(() => {
  fetchPosts();
  fetchCategories();
});
</script>

<style scoped>
/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 9999px;
  padding: 0.7rem 1.2rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, rgba(37,99,235,1), rgba(14,165,233,0.95));
  box-shadow: 0 10px 30px rgba(2,6,23,0.10);
  transition: transform .15s ease, filter .15s ease;
}
.btn-primary:hover { transform: translateY(-1px); filter: brightness(1.02); }
:global(.dark) .btn-primary { box-shadow: 0 10px 30px rgba(0,0,0,0.35); }

.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 9999px;
  padding: 0.7rem 1.2rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid rgba(228,228,231,0.9);
  background: rgba(255,255,255,0.65);
  color: rgb(24 24 27);
  transition: transform .15s ease, background .15s ease, border-color .15s ease;
}
.btn-ghost:hover { transform: translateY(-1px); background: rgba(255,255,255,0.85); border-color: rgba(212,212,216,1); }
:global(.dark) .btn-ghost {
  border-color: rgba(63,63,70,0.9);
  background: rgba(9,9,11,0.35);
  color: rgb(244 244 245);
}
:global(.dark) .btn-ghost:hover { background: rgba(24,24,27,0.55); border-color: rgba(82,82,91,1); }

/* Panels & chips */
.panel {
  border-radius: 1rem;
  border: 1px solid rgba(228,228,231,0.75);
  background: rgba(255,255,255,0.60);
  padding: 1.25rem;
  box-shadow: 0 10px 30px rgba(2,6,23,0.06);
  backdrop-filter: blur(10px);
}
:global(.dark) .panel {
  border-color: rgba(63,63,70,0.75);
  background: rgba(24,24,27,0.28);
  box-shadow: 0 12px 40px rgba(0,0,0,0.35);
}

.chip {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  border: 1px solid rgba(228, 228, 231, 0.9);
  background: rgba(255, 255, 255, 0.65);
  padding: 0.25rem 0.6rem;
  font-size: 0.75rem;
  color: rgb(39 39 42);
}
:global(.dark) .chip {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(9, 9, 11, 0.35);
  color: rgb(228 228 231);
}
.chip-accent {
  border-color: rgba(59,130,246,0.35);
  background: rgba(59,130,246,0.10);
  color: rgba(30,64,175,1);
}
:global(.dark) .chip-accent {
  border-color: rgba(59,130,246,0.40);
  background: rgba(59,130,246,0.14);
  color: rgba(191,219,254,1);
}

/* Pills */
.pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  border-radius: 9999px;
  border: 1px solid rgba(228,228,231,0.75);
  background: rgba(255,255,255,0.55);
  padding: .55rem .85rem;
}
:global(.dark) .pill { border-color: rgba(63,63,70,0.75); background: rgba(9,9,11,0.30); }
.pill-k { font-size: .70rem; letter-spacing: .18em; text-transform: uppercase; color: rgba(113,113,122,1); }
.pill-v { font-size: .85rem; color: rgba(39,39,42,1); }
:global(.dark) .pill-k { color: rgba(161,161,170,1); }
:global(.dark) .pill-v { color: rgba(244,244,245,1); }

/* Projects */
.project-card {
  position: relative;
  border-radius: 1.25rem;
  padding: 1px;
  background: linear-gradient(135deg, rgba(37,99,235,0.28), rgba(14,165,233,0.10), rgba(255,255,255,0));
  transition: transform .15s ease, filter .15s ease;
}
.project-card:hover { transform: translateY(-2px); filter: brightness(1.01); }
.project-card > * { pointer-events: none; } /* keep it as a single link feel */

.project-card::before { content: ""; display: none; } /* placeholder for future */
.project-card > div,
.project-card > p,
.project-card > .project-tags { pointer-events: none; }

.project-card {
  text-decoration: none;
}
.project-card .project-top,
.project-card .project-desc,
.project-card .project-tags {
  pointer-events: none;
}

.project-card-inner { display: none; }

.project-card { color: inherit; }

.project-card {
  overflow: hidden;
}
.project-card::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(600px circle at var(--mx, 30%) var(--my, 30%), rgba(59,130,246,0.12), transparent 45%);
  opacity: .7;
  pointer-events: none;
}

.project-card > .project-top,
.project-card > .project-desc,
.project-card > .project-tags {
  position: relative;
  z-index: 1;
}

.project-top {
  border-radius: 1.25rem;
  background: rgba(255,255,255,0.70);
  border: 1px solid rgba(228,228,231,0.75);
  padding: 1.1rem 1.1rem .85rem 1.1rem;
  display: flex;
  align-items: center;
  gap: .9rem;
}
:global(.dark) .project-top {
  background: rgba(24,24,27,0.35);
  border-color: rgba(63,63,70,0.75);
}
.project-icon {
  width: 40px; height: 40px;
  border-radius: 9999px;
  display: grid; place-items: center;
  border: 1px solid rgba(228,228,231,0.75);
  background: rgba(255,255,255,0.75);
  font-weight: 700;
}
:global(.dark) .project-icon {
  border-color: rgba(63,63,70,0.75);
  background: rgba(9,9,11,0.35);
}
.project-title { font-weight: 700; letter-spacing: -0.01em; }
.project-sub { font-size: .85rem; color: rgba(113,113,122,1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
:global(.dark) .project-sub { color: rgba(161,161,170,1); }
.project-cta { margin-left: auto; font-size: .85rem; color: rgba(59,130,246,1); font-weight: 600; }
:global(.dark) .project-cta { color: rgba(147,197,253,1); }

.project-desc {
  margin-top: .7rem;
  padding: 0 1.2rem;
  font-size: .92rem;
  color: rgba(63,63,70,1);
  line-height: 1.6;
}
:global(.dark) .project-desc { color: rgba(212,212,216,1); }

.project-tags {
  margin-top: .7rem;
  padding: 0 1.2rem 1.1rem 1.2rem;
  display: flex;
  gap: .5rem;
  flex-wrap: wrap;
}
.tag {
  border-radius: 9999px;
  border: 1px solid rgba(228,228,231,0.75);
  background: rgba(255,255,255,0.55);
  padding: .22rem .55rem;
  font-size: .72rem;
  color: rgba(63,63,70,1);
}
:global(.dark) .tag { border-color: rgba(63,63,70,0.75); background: rgba(9,9,11,0.28); color: rgba(228,228,231,1); }

/* Topics */
.topic-item {
  border-radius: .75rem;
  border: 1px solid rgba(228,228,231,0.60);
  background: rgba(255,255,255,0.55);
  padding: .55rem .75rem;
  font-size: .86rem;
  color: rgba(63,63,70,1);
  transition: background .15s ease, border-color .15s ease, transform .15s ease;
}
.topic-item:hover {
  transform: translateY(-1px);
  background: rgba(255,255,255,0.85);
  border-color: rgba(212,212,216,1);
}
:global(.dark) .topic-item {
  border-color: rgba(63,63,70,0.60);
  background: rgba(9,9,11,0.30);
  color: rgba(228,228,231,1);
}
:global(.dark) .topic-item:hover {
  background: rgba(24,24,27,0.55);
  border-color: rgba(82,82,91,1);
}

/* Spotlight effect */
.spotlight {
  background: radial-gradient(700px circle at var(--mx, 50%) var(--my, 20%),
    rgba(59,130,246,0.12),
    transparent 45%);
  opacity: 1;
}
:global(.dark) .spotlight {
  background: radial-gradient(700px circle at var(--mx, 50%) var(--my, 20%),
    rgba(59,130,246,0.16),
    transparent 48%);
}

/* scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(161, 161, 170, 0.35); border-radius: 999px; }
.custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: rgba(161, 161, 170, 0.55); }
</style>
