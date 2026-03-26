<template>
  <div class="space-y-6">
    <div
      class="bg-white dark:bg-[#111] rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300"
    >
      <ImageUploader
        :model-value="modelValue.coverImage"
        label="Cover Image"
        @update:model-value="emit('update:modelValue', { ...modelValue, coverImage: $event })"
      />
    </div>

    <div
      class="bg-white dark:bg-[#111] rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors duration-300"
    >
      <div>
        <label
          class="block text-xs font-mono font-bold text-gray-500 dark:text-gray-400 uppercase mb-2"
          >Excerpt</label
        >
        <textarea
          :value="modelValue.excerpt"
          rows="3"
          class="w-full bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 dark:text-gray-300 transition-colors"
          placeholder="Brief description for SEO..."
          @input="emit('update:modelValue', { ...modelValue, excerpt: $event.target.value })"
        ></textarea>
      </div>

      <div>
        <label
          class="block text-xs font-mono font-bold text-gray-500 dark:text-gray-400 uppercase mb-2"
          >Category</label
        >
        <div class="relative">
          <select
            :value="modelValue.categoryId"
            class="w-full bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 dark:text-gray-300 appearance-none py-2.5 px-3 transition-colors"
            @change="emit('update:modelValue', { ...modelValue, categoryId: $event.target.value })"
          >
            <option value="" disabled>Select a category</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
          <div
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      <div>
        <label
          class="block text-xs font-mono font-bold text-gray-500 dark:text-gray-400 uppercase mb-2"
          >Tags</label
        >
        <div class="flex flex-wrap gap-2 mb-3 min-h-[30px]">
          <span
            v-for="tagId in modelValue.tagIds"
            :key="tagId"
            class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
          >
            #{{ findTagName(tagId) }}
            <button
              class="ml-1.5 hover:text-blue-900 dark:hover:text-white transition-colors"
              @click="removeTag(tagId)"
            >
              &times;
            </button>
          </span>
        </div>
        <div class="relative">
          <select
            v-model="selectedTag"
            class="w-full bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 dark:text-gray-300 appearance-none py-2.5 px-3 transition-colors"
            @change="addTag"
          >
            <option value="">+ Add Tag</option>
            <option v-for="tag in availableTags" :key="tag.id" :value="tag.id">
              {{ tag.name }}
            </option>
          </select>
          <div
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="pt-4 border-t border-gray-100 dark:border-gray-800">
        <label
          class="block text-xs font-mono font-bold text-gray-500 dark:text-gray-400 uppercase mb-2"
        >
          Publish Date
        </label>
        <input
          type="datetime-local"
          :value="modelValue.createdAt"
          class="w-full bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 dark:text-gray-300 transition-colors"
          @input="emit('update:modelValue', { ...modelValue, createdAt: $event.target.value })"
        />
        <p class="text-[10px] text-gray-400 mt-1 font-mono">Leave blank for current time.</p>
      </div>

      <div
        class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800"
      >
        <span class="text-sm font-bold text-gray-700 dark:text-gray-300 font-mono">PUBLISHED</span>
        <button
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
          :class="modelValue.published ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'"
          @click="emit('update:modelValue', { ...modelValue, published: !modelValue.published })"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm"
            :class="modelValue.published ? 'translate-x-6' : 'translate-x-1'"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import ImageUploader from './ImageUploader.vue';

const props = defineProps({
  modelValue: { type: Object, required: true },
  categories: { type: Array, default: () => [] },
  tags: { type: Array, default: () => [] },
});

const emit = defineEmits(['update:modelValue']);

const selectedTag = ref('');

const availableTags = computed(() =>
  props.tags.filter((tag) => !props.modelValue.tagIds.includes(tag.id)),
);

const findTagName = (tagId) => {
  const tag = props.tags.find((t) => t.id === tagId);
  return tag ? tag.name : 'Unknown';
};

const addTag = () => {
  if (selectedTag.value && !props.modelValue.tagIds.includes(selectedTag.value)) {
    emit('update:modelValue', {
      ...props.modelValue,
      tagIds: [...props.modelValue.tagIds, selectedTag.value],
    });
    selectedTag.value = '';
  }
};

const removeTag = (tagId) => {
  emit('update:modelValue', {
    ...props.modelValue,
    tagIds: props.modelValue.tagIds.filter((id) => id !== tagId),
  });
};
</script>
