<template>
    <div class="categories-manager">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">分类管理</h2>
        <button 
          @click="showAddModal = true" 
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          新增分类
        </button>
      </div>
      
      <!-- 分类列表 -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div v-if="loading" class="p-6 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-2 text-gray-600">加载中...</p>
        </div>
        
        <div v-else-if="categories.length === 0" class="p-6 text-center text-gray-500">
          还没有创建任何分类
        </div>
        
        <div v-else>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">文章数</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="category in categories" :key="category.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ category.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ category.slug }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ category.postCount || 0 }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    @click="editCategory(category)" 
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    编辑
                  </button>
                  <button 
                    @click="confirmDelete(category)" 
                    class="text-red-600 hover:text-red-900"
                    :disabled="category.postCount > 0"
                    :class="{'opacity-50 cursor-not-allowed': category.postCount > 0}"
                  >
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- 添加/编辑分类模态框 -->
      <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
          <h3 class="text-lg font-semibold mb-4">{{ showEditModal ? '编辑分类' : '新增分类' }}</h3>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="name">分类名称</label>
            <input
              id="name"
              v-model="categoryForm.name"
              type="text"
              class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入分类名称"
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="description">分类描述</label>
            <textarea
              id="description"
              v-model="categoryForm.description"
              class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入分类描述（可选）"
              rows="3"
            ></textarea>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button 
              @click="closeModal" 
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              取消
            </button>
            <button 
              @click="submitCategory" 
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import api from '../../api';
  
  const categories = ref([]);
  const loading = ref(true);
  const showAddModal = ref(false);
  const showEditModal = ref(false);
  const categoryForm = ref({
    id: null,
    name: '',
    description: ''
  });
  
  // 获取分类列表
  const fetchCategories = async () => {
    loading.value = true;
    try {
      const response = await api.getCategories();
      categories.value = response || [];
    } catch (error) {
      console.error('获取分类失败:', error);
      categories.value = [];
    } finally {
      loading.value = false;
    }
  };
  
  // 编辑分类
  const editCategory = (category) => {
    categoryForm.value = {
      id: category.id,
      name: category.name,
      description: category.description || ''
    };
    showEditModal.value = true;
  };
  
  // 提交分类(新增或编辑)
  const submitCategory = async () => {
    if (!categoryForm.value.name.trim()) {
      alert('分类名称不能为空');
      return;
    }
    
    try {
      if (showEditModal.value) {
        // 编辑现有分类
        await api.updateCategory(categoryForm.value.id, {
          name: categoryForm.value.name,
          description: categoryForm.value.description
        });
        alert('分类更新成功');
      } else {
        // 新增分类
        await api.createCategory({
          name: categoryForm.value.name,
          description: categoryForm.value.description
        });
        alert('分类创建成功');
      }
      
      // 关闭模态框并刷新列表
      closeModal();
      fetchCategories();
    } catch (error) {
      console.error('提交分类失败:', error);
      alert('操作失败: ' + (error.response?.data?.message || '未知错误'));
    }
  };
  
  // 确认删除
  const confirmDelete = async (category) => {
    if (category.postCount > 0) {
      alert('该分类下有文章，无法删除');
      return;
    }
    
    if (confirm(`确定要删除分类"${category.name}"吗？此操作不可恢复。`)) {
      try {
        await api.deleteCategory(category.id);
        alert('分类已成功删除');
        // 刷新列表
        fetchCategories();
      } catch (error) {
        console.error('删除分类失败:', error);
        alert('删除分类失败: ' + (error.response?.data?.message || '未知错误'));
      }
    }
  };
  
  // 关闭模态框
  const closeModal = () => {
    showAddModal.value = false;
    showEditModal.value = false;
    categoryForm.value = {
      id: null,
      name: '',
      description: ''
    };
  };
  
  onMounted(() => {
    fetchCategories();
  });
  </script>