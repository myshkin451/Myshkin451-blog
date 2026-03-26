<template>
  <div class="w-full">
    <label
      v-if="label"
      class="block text-xs font-mono font-bold text-gray-500 dark:text-gray-400 uppercase mb-2"
    >
      {{ label }}
    </label>

    <div
      v-if="previewUrl"
      class="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm aspect-video bg-gray-50 dark:bg-gray-800"
    >
      <img
        :src="previewUrl"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div
        class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"
      >
        <button
          class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold font-mono transition-colors shadow-lg transform hover:scale-105"
          @click.prevent="removeImage"
        >
          DELETE
        </button>
      </div>
    </div>

    <div
      v-else
      class="relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300"
      :class="[
        dragover
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
          : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/50',
      ]"
      @dragover.prevent="dragover = true"
      @dragleave.prevent="dragover = false"
      @drop.prevent="onDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        class="hidden"
        accept="image/png,image/jpeg,image/gif,image/webp"
        @change="onFileChange"
      />

      <div v-if="uploading" class="flex flex-col items-center justify-center py-4">
        <svg
          class="animate-spin h-8 w-8 text-blue-500 mb-3"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span class="text-xs font-mono text-blue-500 animate-pulse">UPLOADING...</span>
      </div>

      <div v-else class="flex flex-col items-center justify-center cursor-pointer py-2">
        <svg
          class="w-10 h-10 text-gray-400 dark:text-gray-500 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p class="text-sm font-bold text-gray-600 dark:text-gray-300">Click or Drag to Upload</p>
        <p class="text-xs text-gray-400 mt-1 font-mono">PNG, JPG, GIF up to 5MB</p>
      </div>
    </div>

    <div v-if="error" class="mt-2 text-xs font-mono text-red-500 flex items-center">
      <span class="mr-1">⚠</span> {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import api from '../api';

// Vue 3 标准 v-model 是 'modelValue'
const props = defineProps({
  modelValue: String,
  label: String,
  uploadType: { type: String, default: 'image' }, // 'image' (generic) | 'avatar'
});

const emit = defineEmits(['update:modelValue', 'upload-success', 'upload-error']);

const fileInputRef = ref(null);
const uploading = ref(false);
const dragover = ref(false);
const error = ref('');
const previewUrl = ref('');

const getFullImageUrl = (path) => {
  if (!path) return '';

  // 1. 如果已经是完整的 http 链接，直接用
  if (path.startsWith('http')) return path;

  // 2. 如果是静态资源 (/uploads 开头)，直接拼域名前缀，不要拼 /api
  // 结果会是: https://myshkin451.com/uploads/posts/xxx.jpg
  if (path.startsWith('/uploads')) {
    return `${window.location.origin}${path}`;
  }

  // 3. 其他情况才拼 API 地址
  const baseUrl = import.meta.env.VITE_API_URL || '';
  return `${baseUrl}${path}`;
};

// 初始化回显
onMounted(() => {
  if (props.modelValue) {
    previewUrl.value = getFullImageUrl(props.modelValue);
  }
});

// 监听变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) {
      previewUrl.value = '';
    } else if (newVal !== previewUrl.value) {
      previewUrl.value = getFullImageUrl(newVal);
    }
  },
);

const triggerFileInput = () => fileInputRef.value.click();

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) handleUpload(file);
  e.target.value = null; // Reset input
};

const onDrop = (e) => {
  dragover.value = false;
  const file = e.dataTransfer.files[0];
  if (file) handleUpload(file);
};

const handleUpload = async (file) => {
  // ... (保留你之前的校验逻辑) ...
  if (!file.type.startsWith('image/')) {
    error.value = 'File must be an image.';
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    error.value = 'File size exceeds 20MB.';
    return;
  } // 改成 20M 匹配服务器设置

  uploading.value = true;
  error.value = '';

  try {
    const fd = new FormData();
    const fieldName = props.uploadType === 'avatar' ? 'avatar' : 'image';
    fd.append(fieldName, file);

    let res;
    if (props.uploadType === 'avatar') {
      res = await api.uploadAvatar(fd);
    } else {
      res = await api.uploadPostImage(fd);
    }

    const { url, path } = res;

    // 更新预览 (使用 path 走一遍 getFullImageUrl 逻辑，或者直接用 url)
    previewUrl.value = url;
    emit('update:modelValue', path);
    emit('upload-success', url);
  } catch (err) {
    console.error(err);
    error.value = 'Upload failed.';
    emit('upload-error', err);
  } finally {
    uploading.value = false;
  }
};

const removeImage = () => {
  previewUrl.value = '';
  emit('update:modelValue', '');
};
</script>
