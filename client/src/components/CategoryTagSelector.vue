<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- 分类选择 -->
    <div>
      <label class="block text-gray-700 text-sm font-bold mb-2">文章分类</label>
      <select
        :value="categoryId"
        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        @change="$emit('update:categoryId', $event.target.value)"
      >
        <option value="">请选择分类</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">
          {{ category.name }}
        </option>
      </select>
    </div>

    <!-- 标签选择 -->
    <div>
      <label class="block text-gray-700 text-sm font-bold mb-2">文章标签</label>
      <div class="flex flex-wrap items-center border rounded-lg p-2">
        <!-- 已选标签 -->
        <div
          v-for="tagId in selectedTagIds"
          :key="tagId"
          class="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 mb-2 flex items-center"
        >
          <span>{{ findTagName(tagId) }}</span>
          <button class="ml-1 text-blue-600 hover:text-blue-800" @click="removeTag(tagId)">
            &times;
          </button>
        </div>

        <!-- 标签选择下拉框 -->
        <select
          v-model="selectedTag"
          class="py-1 px-2 border-none focus:outline-none flex-grow min-w-[100px]"
          @change="addTag"
        >
          <option value="">添加标签...</option>
          <option v-for="tag in availableTags" :key="tag.id" :value="tag.id">
            {{ tag.name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 组件属性
const props = defineProps({
  categories: Array,
  tags: Array,
  categoryId: [String, Number],
  selectedTagIds: Array,
});

// 组件事件
const emit = defineEmits(['update:categoryId', 'update:selectedTagIds']);

// 本地状态
const selectedTag = ref('');

// 计算可用标签（排除已选）
const availableTags = computed(() => {
  return props.tags.filter((tag) => !props.selectedTagIds.includes(tag.id));
});

// 通过ID查找标签名称
const findTagName = (tagId) => {
  const tag = props.tags.find((t) => t.id === tagId);
  return tag ? tag.name : '未知标签';
};

// 添加标签
const addTag = () => {
  if (selectedTag.value && !props.selectedTagIds.includes(selectedTag.value)) {
    const newTags = [...props.selectedTagIds, selectedTag.value];
    emit('update:selectedTagIds', newTags);
    selectedTag.value = '';
  }
};

// 移除标签
const removeTag = (tagId) => {
  const newTags = props.selectedTagIds.filter((id) => id !== tagId);
  emit('update:selectedTagIds', newTags);
};
</script>
