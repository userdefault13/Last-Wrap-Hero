<template>
  <div class="flex items-start">
    <div class="flex-shrink-0">
      <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
        <svg class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
    </div>
    <div class="ml-4">
      <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">{{ title }}</h4>
      <p class="text-gray-600 dark:text-gray-300">{{ description }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  description: String
})
</script>

