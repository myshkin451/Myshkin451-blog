<template>
  <div class="metadata-editor">
    <!-- 文章标题 -->
    <div class="mb-6">
      <label for="title" class="block text-gray-700 text-sm font-bold mb-2">文章标题</label>
      <input
        id="title"
        :value="title"
        type="text"
        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="请输入文章标题"
        @input="$emit('update:title', $event.target.value)"
      />
    </div>

    <!-- 文章摘要 -->
    <div class="mb-6">
      <label for="excerpt" class="block text-gray-700 text-sm font-bold mb-2">文章摘要</label>
      <textarea
        id="excerpt"
        :value="excerpt"
        rows="2"
        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="请输入文章摘要（可选）"
        @input="$emit('update:excerpt', $event.target.value)"
      ></textarea>
    </div>
  </div>
  <!-- 封面图片上传 -->
  <div class="mb-6">
    <label class="block text-gray-700 text-sm font-bold mb-2">文章封面</label>
    <ImageUploader
      v-model:value="article.coverImage"
      label="上传文章封面图片"
      upload-type="post"
      :post-id="article.id"
      @upload-success="handleCoverUploadSuccess"
    />
  </div>
</template>

<script setup>
// 组件属性
defineProps({
  title: String,
  excerpt: String,
});

// 组件事件
defineEmits(['update:title', 'update:excerpt']);
</script>
