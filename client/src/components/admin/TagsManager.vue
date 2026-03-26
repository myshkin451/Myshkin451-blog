<template>
  <div class="tags-manager">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold">标签管理</h2>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        @click="showAddModal = true"
      >
        新增标签
      </button>
    </div>

    <!-- 标签列表 -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div v-if="loading" class="p-6 text-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"
        ></div>
        <p class="mt-2 text-gray-600">加载中...</p>
      </div>

      <div v-else-if="tags.length === 0" class="p-6 text-center text-gray-500">
        还没有创建任何标签
      </div>

      <div v-else>
        <div class="p-6">
          <div class="flex flex-wrap gap-3">
            <div
              v-for="tag in tags"
              :key="tag.id"
              class="inline-flex items-center px-3 py-2 rounded bg-gray-100 text-gray-800"
            >
              <span class="mr-2">{{ tag.name }}</span>
              <span class="text-xs text-gray-500">({{ tag.postCount || 0 }})</span>
              <div class="ml-2 flex items-center">
                <button class="text-blue-600 hover:text-blue-900 mr-1" @click="editTag(tag)">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  class="text-red-600 hover:text-red-900"
                  :disabled="tag.postCount > 0"
                  :class="{ 'opacity-50 cursor-not-allowed': tag.postCount > 0 }"
                  @click="confirmDelete(tag)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑标签模态框 -->
    <div
      v-if="showAddModal || showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">{{ showEditModal ? '编辑标签' : '新增标签' }}</h3>

        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="name">标签名称</label>
          <input
            id="name"
            v-model="tagForm.name"
            type="text"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入标签名称"
          />
        </div>

        <div class="flex justify-end space-x-3">
          <button
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            @click="closeModal"
          >
            取消
          </button>
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            @click="submitTag"
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

const tags = ref([]);
const loading = ref(true);
const showAddModal = ref(false);
const showEditModal = ref(false);
const tagForm = ref({
  id: null,
  name: '',
});

// 获取标签列表
const fetchTags = async () => {
  loading.value = true;
  try {
    const response = await api.getTags();
    tags.value = response || [];
  } catch (error) {
    console.error('获取标签失败:', error);
    tags.value = [];
  } finally {
    loading.value = false;
  }
};

// 编辑标签
const editTag = (tag) => {
  tagForm.value = {
    id: tag.id,
    name: tag.name,
  };
  showEditModal.value = true;
};

// 提交标签(新增或编辑)
const submitTag = async () => {
  if (!tagForm.value.name.trim()) {
    alert('标签名称不能为空');
    return;
  }

  try {
    if (showEditModal.value) {
      // 编辑现有标签
      await api.updateTag(tagForm.value.id, {
        name: tagForm.value.name,
      });
      alert('标签更新成功');
    } else {
      // 新增标签
      await api.createTag({
        name: tagForm.value.name,
      });
      alert('标签创建成功');
    }

    // 关闭模态框并刷新列表
    closeModal();
    fetchTags();
  } catch (error) {
    console.error('提交标签失败:', error);
    alert('操作失败: ' + (error.response?.data?.message || '未知错误'));
  }
};

// 确认删除
const confirmDelete = async (tag) => {
  if (tag.postCount > 0) {
    alert('该标签下有文章，无法删除');
    return;
  }

  if (confirm(`确定要删除标签"${tag.name}"吗？此操作不可恢复。`)) {
    try {
      await api.deleteTag(tag.id);
      alert('标签已成功删除');
      // 刷新列表
      fetchTags();
    } catch (error) {
      console.error('删除标签失败:', error);
      alert('删除标签失败: ' + (error.response?.data?.message || '未知错误'));
    }
  }
};

// 关闭模态框
const closeModal = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  tagForm.value = {
    id: null,
    name: '',
  };
};

onMounted(() => {
  fetchTags();
});
</script>
