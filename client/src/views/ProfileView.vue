<template>
    <div>
      <Navbar />
      
      <div class="container mx-auto px-4 py-8">
        <!-- 加载状态 -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        
        <!-- 错误状态 -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p class="text-red-600 mb-4">{{ error }}</p>
          <button 
            @click="fetchUserProfile" 
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            重试
          </button>
        </div>
        
        <!-- 个人中心内容 -->
        <div v-else-if="user" class="flex flex-col md:flex-row">
          <!-- 左侧侧边栏 -->
          <div class="w-full md:w-1/4 mb-6 md:mb-0 md:pr-6">
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <!-- 用户头像 -->
              <div class="flex flex-col items-center mb-6">
                <div class="relative">
                  <img 
                    :src="user.avatar || '/img/default-avatar.png'" 
                    alt="用户头像" 
                    class="w-32 h-32 rounded-full object-cover border-4 border-white shadow"
                  >
                  <button 
                    @click="activeTab = 'avatar'" 
                    class="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow hover:bg-blue-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                <h1 class="text-xl font-bold mt-4">{{ user.username }}</h1>
                <p class="text-gray-600">{{ user.email }}</p>
              </div>
              
              <!-- 侧边栏导航 -->
              <nav class="space-y-2">
                <button 
                  @click="activeTab = 'profile'" 
                  class="w-full text-left px-4 py-2 rounded-lg flex items-center"
                  :class="activeTab === 'profile' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  个人资料
                </button>
                <button 
                  @click="activeTab = 'posts'" 
                  class="w-full text-left px-4 py-2 rounded-lg flex items-center"
                  :class="activeTab === 'posts' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  我的文章
                </button>
                <button 
                  @click="activeTab = 'comments'" 
                  class="w-full text-left px-4 py-2 rounded-lg flex items-center"
                  :class="activeTab === 'comments' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  我的评论
                </button>
                <button 
                  @click="activeTab = 'security'" 
                  class="w-full text-left px-4 py-2 rounded-lg flex items-center"
                  :class="activeTab === 'security' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  账号安全
                </button>
              </nav>
            </div>
          </div>
          
          <!-- 右侧主内容区 -->
          <div class="w-full md:w-3/4">
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <!-- 个人资料 -->
              <div v-if="activeTab === 'profile'">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="text-xl font-bold">个人资料</h2>
                  <button 
                    @click="isEditing = !isEditing" 
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
                  >
                    <svg v-if="!isEditing" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {{ isEditing ? '取消编辑' : '编辑资料' }}
                  </button>
                </div>
                
                <!-- 查看模式 -->
                <div v-if="!isEditing" class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div class="text-gray-500 text-sm">用户名</div>
                      <div>{{ user.username }}</div>
                    </div>
                    <div>
                      <div class="text-gray-500 text-sm">邮箱</div>
                      <div>{{ user.email }}</div>
                    </div>
                  </div>
                  <div>
                    <div class="text-gray-500 text-sm">个人简介</div>
                    <div class="whitespace-pre-line">{{ user.bio || '这个人很懒，什么都没留下...' }}</div>
                  </div>
                  <div>
                    <div class="text-gray-500 text-sm">注册时间</div>
                    <div>{{ formatDate(user.createdAt) }}</div>
                  </div>
                </div>
                
                <!-- 编辑模式 -->
                <form v-else @submit.prevent="updateProfile" class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">用户名</label>
                      <input 
                        v-model="profileForm.username" 
                        type="text" 
                        class="w-full px-3 py-2 border rounded-lg"
                      >
                    </div>
                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">邮箱</label>
                      <input 
                        v-model="profileForm.email" 
                        type="email" 
                        class="w-full px-3 py-2 border rounded-lg"
                      >
                    </div>
                  </div>
                  <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">个人简介</label>
                    <textarea 
                      v-model="profileForm.bio" 
                      rows="4" 
                      class="w-full px-3 py-2 border rounded-lg"
                      placeholder="介绍一下你自己..."
                    ></textarea>
                  </div>
                  <div class="flex justify-end">
                    <button 
                      type="submit" 
                      class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                      :disabled="updating"
                    >
                      {{ updating ? '保存中...' : '保存资料' }}
                    </button>
                  </div>
                </form>
              </div>
  
              <!-- 头像上传 -->
              <div v-else-if="activeTab === 'avatar'">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="text-xl font-bold">修改头像</h2>
                  <button 
                    @click="activeTab = 'profile'" 
                    class="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                  >
                    返回
                  </button>
                </div>
                
                <div class="flex flex-col items-center">
                  <ImageUploader 
                    :value="user.avatar" 
                    label="上传新头像"
                    upload-type="avatar"
                    @upload-success="handleAvatarUpload"
                  />
                </div>
              </div>
              
              <!-- 我的文章 -->
              <div v-else-if="activeTab === 'posts'">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="text-xl font-bold">我的文章</h2>
                  <router-link 
                    to="/write" 
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    写文章
                  </router-link>
                </div>
                
                <!-- 文章加载状态 -->
                <div v-if="loadingPosts" class="flex justify-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
                
                <!-- 无文章提示 -->
                <div v-else-if="userPosts.length === 0" class="bg-gray-50 rounded-lg p-8 text-center">
                  <p class="text-gray-600 mb-4">你还没有发表过文章</p>
                  <router-link to="/write" class="text-blue-600 hover:underline">
                    立即写文章
                  </router-link>
                </div>
                
                <!-- 文章列表 -->
                <div v-else class="space-y-4">
                  <div 
                    v-for="post in userPosts" 
                    :key="post.id" 
                    class="border rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div class="flex justify-between">
                      <router-link :to="`/posts/${post.id}`" class="text-lg font-medium hover:text-blue-600">
                        {{ post.title }}
                      </router-link>
                      <span class="text-sm text-gray-500">{{ formatDate(post.createdAt) }}</span>
                    </div>
                    <div class="flex items-center text-sm mt-2">
                      <span class="mr-3">
                        <span class="text-gray-600">状态:</span>
                        <span :class="post.status === 'published' ? 'text-green-600' : 'text-yellow-600'">
                          {{ post.status === 'published' ? '已发布' : '草稿' }}
                        </span>
                      </span>
                      <span class="mr-3">
                        <span class="text-gray-600">浏览:</span>
                        {{ post.viewCount || 0 }}
                      </span>
                    </div>
                    <div class="flex justify-end mt-2 space-x-2">
                      <router-link :to="`/edit/${post.id}`" class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                        编辑
                      </router-link>
                      <button 
                        @click="confirmDeletePost(post.id)"
                        class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 我的评论 -->
              <div v-else-if="activeTab === 'comments'">
                <h2 class="text-xl font-bold mb-6">我的评论</h2>
                
                <!-- 评论加载状态 -->
                <div v-if="loadingComments" class="flex justify-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
                
                <!-- 无评论提示 -->
                <div v-else-if="userComments.length === 0" class="bg-gray-50 rounded-lg p-8 text-center">
                  <p class="text-gray-600">你还没有发表过评论</p>
                </div>
                
                <!-- 评论列表 -->
                <div v-else class="space-y-4">
                  <div 
                    v-for="comment in userComments" 
                    :key="comment.id" 
                    class="border rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div class="text-gray-700">{{ comment.content }}</div>
                    <div class="flex justify-between items-center mt-2">
                      <router-link :to="`/posts/${comment.postId}`" class="text-sm text-blue-600 hover:underline">
                        查看文章
                      </router-link>
                      <span class="text-sm text-gray-500">{{ formatDate(comment.createdAt) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 账号安全 -->
              <div v-else-if="activeTab === 'security'">
                <h2 class="text-xl font-bold mb-6">账号安全</h2>
                
                <div class="border rounded-lg p-4 mb-4">
                  <h3 class="text-lg font-medium mb-4">修改密码</h3>
                  <form @submit.prevent="updatePassword" class="space-y-4">
                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">当前密码</label>
                      <input 
                        v-model="passwordForm.currentPassword" 
                        type="password" 
                        class="w-full px-3 py-2 border rounded-lg"
                        required
                      >
                    </div>
                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">新密码</label>
                      <input 
                        v-model="passwordForm.newPassword" 
                        type="password" 
                        class="w-full px-3 py-2 border rounded-lg"
                        required
                      >
                    </div>
                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">确认新密码</label>
                      <input 
                        v-model="passwordForm.confirmPassword" 
                        type="password" 
                        class="w-full px-3 py-2 border rounded-lg"
                        required
                      >
                    </div>
                    
                    <!-- 错误提示 -->
                    <div v-if="passwordError" class="text-red-600 text-sm">
                      {{ passwordError }}
                    </div>
                    
                    <div class="flex justify-end">
                      <button 
                        type="submit" 
                        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        :disabled="updatingPassword"
                      >
                        {{ updatingPassword ? '更新中...' : '更新密码' }}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, watch} from 'vue';
  import { useRouter } from 'vue-router';
  import Navbar from '../components/Navbar.vue';
  import Footer from '../components/Footer.vue';
  import ImageUploader from '../components/ImageUploader.vue';
  import api from '../api';
  
  const router = useRouter();
  
  // 状态变量
  const loading = ref(true);
  const error = ref(null);
  const user = ref(null);
  const activeTab = ref('profile');
  const isEditing = ref(false);
  const updating = ref(false);
  const loadingPosts = ref(false);
  const loadingComments = ref(false);
  const userPosts = ref([]);
  const userComments = ref([]);
  const updatingPassword = ref(false);
  const passwordError = ref(null);
  
  // 表单数据
  const profileForm = reactive({
    username: '',
    email: '',
    bio: ''
  });
  
  const passwordForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // 获取用户个人资料
  const fetchUserProfile = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      // 检查本地存储中的用户数据
      const userJSON = localStorage.getItem('user');
      if (!userJSON) {
        router.push('/login?redirect=/profile');
        return;
      }
      
      // 尝试从API获取最新用户资料
      const response = await api.getUserProfile();
      user.value = response.user;
      
      // 填充表单数据
      profileForm.username = user.value.username || '';
      profileForm.email = user.value.email || '';
      profileForm.bio = user.value.bio || '';
      
    } catch (err) {
      console.error('获取用户资料失败:', err);
      error.value = '获取用户资料失败，请重试';
      
      // 尝试使用本地存储的用户数据作为后备
      try {
        const userJSON = localStorage.getItem('user');
        if (userJSON) {
          user.value = JSON.parse(userJSON);
          profileForm.username = user.value.username || '';
          profileForm.email = user.value.email || '';
          profileForm.bio = user.value.bio || '';
        }
      } catch (e) {
        console.error('解析本地用户数据失败:', e);
      }
    } finally {
      loading.value = false;
    }
  };
  
  // 更新用户资料
  const updateProfile = async () => {
    try {
      updating.value = true;
      
      const response = await api.updateUserProfile({
        username: profileForm.username,
        email: profileForm.email,
        bio: profileForm.bio
      });
      
      // 更新本地用户数据
      user.value = response.user;
      localStorage.setItem('user', JSON.stringify(user.value));
      
      // 退出编辑模式
      isEditing.value = false;
      
    } catch (err) {
      console.error('更新用户资料失败:', err);
      alert('更新用户资料失败: ' + (err.response?.data?.message || '未知错误'));
    } finally {
      updating.value = false;
    }
  };
  
  // 处理头像上传成功
  const handleAvatarUpload = (avatarUrl) => {
    if (user.value) {
      user.value.avatar = avatarUrl;
      
      // 更新本地存储
      const userJSON = localStorage.getItem('user');
      if (userJSON) {
        const userData = JSON.parse(userJSON);
        userData.avatar = avatarUrl;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      // 切换回个人资料标签
      activeTab.value = 'profile';
    }
  };
  
// 获取用户文章
const fetchUserPosts = async () => {
  try {
    loadingPosts.value = true;
    
    const response = await api.getUserPosts();
    userPosts.value = response.posts || [];
    
  } catch (err) {
    console.error('获取用户文章失败:', err);
    userPosts.value = [];
  } finally {
    loadingPosts.value = false;
  }
};

// 获取用户评论
const fetchUserComments = async () => {
  try {
    loadingComments.value = true;
    
    const response = await api.getUserComments();
    userComments.value = response.comments || [];
    
  } catch (err) {
    console.error('获取用户评论失败:', err);
    userComments.value = [];
  } finally {
    loadingComments.value = false;
  }
};
  
  // 确认删除文章
  const confirmDeletePost = async (postId) => {
    if (confirm('确定要删除这篇文章吗？此操作不可撤销。')) {
      try {
        await api.deletePost(postId);
        // 重新获取文章列表
        fetchUserPosts();
      } catch (err) {
        console.error('删除文章失败:', err);
        alert('删除文章失败: ' + (err.response?.data?.message || '未知错误'));
      }
    }
  };
  
  // 更新密码
  const updatePassword = async () => {
    // 验证表单
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      passwordError.value = '两次输入的新密码不一致';
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      passwordError.value = '新密码长度不能少于6位';
      return;
    }
    
    try {
      updatingPassword.value = true;
      passwordError.value = null;
      
      await api.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      // 清空表单
      passwordForm.currentPassword = '';
      passwordForm.newPassword = '';
      passwordForm.confirmPassword = '';
      
      alert('密码更新成功');
      
    } catch (err) {
      console.error('更新密码失败:', err);
      passwordError.value = err.response?.data?.message || '更新密码失败，请重试';
    } finally {
      updatingPassword.value = false;
    }
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('日期格式化错误:', e);
      return dateString;
    }
  };
  
  onMounted(() => {
  fetchUserProfile();
});

// 监听标签变化
watch(activeTab, (newTab, oldTab) => {
  if (newTab === 'posts') {
    fetchUserPosts();
  } else if (newTab === 'comments') {
    fetchUserComments();
  }
});
  </script>