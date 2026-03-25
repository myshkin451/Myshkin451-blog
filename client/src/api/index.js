import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * 从 cookie 中读取 CSRF token
 */
function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : '';
}

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器：非 GET 请求自动附加 CSRF token
api.interceptors.request.use(async config => {
  if (config.method !== 'get') {
    let token = getCsrfToken();
    // 如果 CSRF cookie 尚未存在，先发一个 GET 请求触发设置
    if (!token) {
      await axios.get('/api/health', { withCredentials: true });
      token = getCsrfToken();
    }
    config.headers['x-csrf-token'] = token;
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.error('响应错误:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API服务对象
const apiService = {
  // 获取文章列表
  async getPosts(params = {}) {
    try {
      const response = await api.get('/posts', { params });
      return response.data;
    } catch (error) {
      console.error('获取文章失败:', error);
      return []; // 返回空数组以避免UI错误
    }
  },
  
// 删除文章
  async deletePost(id) {
    try {
      const response = await api.delete(`/posts/${id}`);
      return response.data;
    } catch (error) {
      console.error('删除文章失败:', error);
      throw error;
    }
  },

  // 获取分类列表
  async getCategories() {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('获取分类失败:', error);
      return [];
    }
  },
  
  // 获取标签列表
  async getTags() {
    try {
      const response = await api.get('/tags');
      return response.data;
    } catch (error) {
      console.error('获取标签失败:', error);
      return [];
    }
  },


  // 获取单篇文章详情
  async getPostById(id) {
    try {
      const response = await api.get(`/posts/${id}`);
      return response.data;
    } catch (error) {
      console.error('获取文章详情失败:', error);
      throw error; // 在文章详情页面，我们需要处理这个错误
    }
  },

  // 获取文章评论
  async getPostComments(postId) {
    try {
      const response = await api.get(`/posts/${postId}/comments`);
      return response.data;
    } catch (error) {
      console.error('获取评论失败:', error);
      return [];
    }
  },

  // 添加评论
  async createComment(postId, commentData) {
    try {
      const response = await api.post(`/posts/${postId}/comments`, commentData);
      return response.data;
    } catch (error) {
      console.error('添加评论失败:', error);
      throw error;
    }
  },

  // 更新评论
  async updateComment(commentId, content) {
    try {
      const response = await api.put(`/comments/${commentId}`, { content });
      return response.data;
    } catch (error) {
      console.error('更新评论失败:', error);
      throw error;
    }
  },

  // 删除评论
  async deleteComment(commentId) {
    try {
      const response = await api.delete(`/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error('删除评论失败:', error);
      throw error;
    }
  },

  // 用户登录
  async login(credentials) {
    try {
      const response = await api.post('/users/login', credentials);

      // token 已通过 HttpOnly Cookie 设置，仅存储用户信息用于 UI 展示
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },

  // 用户注册
  async register(userData) {
    try {
      const response = await api.post('/users/register', userData);

      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  },

    // 创建文章
  async createPost(postData) {
    try {
      const response = await api.post('/posts', postData);
      return response.data;
    } catch (error) {
      console.error('创建文章失败:', error);
      throw error;
    }
  },

  // 更新文章
  async updatePost(id, postData) {
    try {
      const response = await api.put(`/posts/${id}`, postData);
      return response.data;
    } catch (error) {
      console.error('更新文章失败:', error);
      throw error;
    }
  },

// 上传文章图片
async uploadPostImage(formData) {
  try {
    // 使用正确的路径
    const response = await api.post('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
   // 直接把后端给的 url / path 返回
    return {
        url:  response.data.url,   // 绝对地址，Markdown 直接用
        path: response.data.path   // 相对路径（若以后要存库）
    };
  } catch (error) {
    console.error('上传图片失败:', error);
    throw error;
  }
},

  // 上传文章封面
  async uploadPostCover(postId, formData) {
    try {
      const response = await api.post(`/posts/${postId}/cover`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('上传封面失败:', error);
      throw error;
    }
  },

  // 上传用户头像
  async uploadAvatar(formData) {
    try {
      const response = await api.post('/uploads/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('上传头像失败:', error);
      throw error;
    }
  },

  // 搜索文章
  async searchPosts(params = {}) {
    try {
      const response = await api.get('/posts/search', { params });
      return response.data;
    } catch (error) {
      console.error('搜索文章失败:', error);
      // 返回空结果而不是抛出错误，以便前端可以处理
      return { 
        posts: [], 
        pagination: { 
          total: 0, 
          totalPages: 0, 
          currentPage: 1, 
          hasMore: false 
        } 
      };
    }
  },

    // 用户个人中心相关API
  async getUserProfile() {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('获取用户资料失败:', error);
      throw error;
    }
  },

  async updateUserProfile(profileData) {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('更新用户资料失败:', error);
      throw error;
    }
  },

  async updatePassword(passwordData) {
    try {
      const response = await api.put('/users/password', passwordData);
      return response.data;
    } catch (error) {
      console.error('更新密码失败:', error);
      throw error;
    }
  },

  async getUserPosts() {
    try {
      const response = await api.get('/users/posts');
      return response.data;
    } catch (error) {
      console.error('获取用户文章失败:', error);
      return { posts: [] }; // 返回空数组而不是抛出错误
    }
  },

  async getUserComments() {
    try {
      const response = await api.get('/users/comments');
      return response.data;
    } catch (error) {
      console.error('获取用户评论失败:', error);
      return { comments: [] }; // 返回空数组而不是抛出错误
    }
  },

    // 通过slug获取分类及其文章
  async getCategoryBySlug(slug) {
    try {
      const response = await api.get(`/categories/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error('获取分类详情失败:', error);
      throw error;
    }
  },

  // 通过slug获取标签及其文章
  async getTagBySlug(slug) {
    try {
      const response = await api.get(`/tags/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error('获取标签详情失败:', error);
      throw error;
    }
  },

  // 用户登出
  async logout() {
    try {
      await api.post('/users/logout');
    } catch {
      // 即使请求失败也清除本地状态
    }
    localStorage.removeItem('user');
  },

// 获取管理统计数据
async getAdminStats() {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    console.error('获取管理统计数据失败:', error);
    return {
      postCount: 0,
      commentCount: 0,
      categoryCount: 0,
      tagCount: 0,
      userCount: 0
    };
  }
},

// 获取最近评论
async getRecentComments(limit = 5) {
  try {
    const response = await api.get('/comments/recent', { params: { limit } });
    return response.data;
  } catch (error) {
    console.error('获取最近评论失败:', error);
    return { comments: [] };
  }
},

// 获取所有评论
async getAllComments(status = '') {
  try {
    const response = await api.get('/comments/all', { params: { status } });
    return response.data;
  } catch (error) {
    console.error('获取所有评论失败:', error);
    return { comments: [] };
  }
},

// 更新评论状态
async updateCommentStatus(commentId, status) {
  try {
    const response = await api.patch(`/comments/${commentId}/moderate`, { status });
    return response.data;
  } catch (error) {
    console.error('更新评论状态失败:', error);
    throw error;
  }
},

// 创建分类
async createCategory(categoryData) {
  try {
    const response = await api.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('创建分类失败:', error);
    throw error;
  }
},

// 更新分类
async updateCategory(id, categoryData) {
  try {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error('更新分类失败:', error);
    throw error;
  }
},

// 删除分类
async deleteCategory(id) {
  try {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('删除分类失败:', error);
    throw error;
  }
},

// 创建标签
async createTag(tagData) {
  try {
    const response = await api.post('/tags', tagData);
    return response.data;
  } catch (error) {
    console.error('创建标签失败:', error);
    throw error;
  }
},

// 更新标签
async updateTag(id, tagData) {
  try {
    const response = await api.put(`/tags/${id}`, tagData);
    return response.data;
  } catch (error) {
    console.error('更新标签失败:', error);
    throw error;
  }
},

// 删除标签
async deleteTag(id) {
  try {
    const response = await api.delete(`/tags/${id}`);
    return response.data;
  } catch (error) {
    console.error('删除标签失败:', error);
    throw error;
  }
}

};

export default apiService;