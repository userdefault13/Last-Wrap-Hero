<template>
  <div class="flex flex-wrap items-center gap-2 sm:gap-3">
    <!-- Utility Actions (Always visible) -->
    <div class="flex items-center gap-2">
      <DarkModeToggle />
      <button
        v-if="showRefresh"
        @click="$emit('refresh')"
        :disabled="loading"
        class="btn-secondary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed w-10 h-10 p-0"
        title="Refresh"
      >
        <svg 
          :class="['w-5 h-5 transition-transform', loading ? 'animate-spin' : '']"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
      <button
        @click="$emit('logout')"
        class="btn-secondary flex items-center justify-center px-4"
      >
        Logout
      </button>
    </div>

    <!-- Main Navigation -->
    <div class="flex flex-wrap items-center gap-2 sm:gap-3">
      <template v-for="item in mainNavItems" :key="item.to || item.action">
        <NuxtLink
          v-if="item.to"
          :to="item.to"
          class="btn-secondary flex items-center justify-center text-sm px-3 sm:px-4"
          :class="{ 'bg-primary-100 dark:bg-primary-900/30 border-primary-600 dark:border-primary-400': item.active }"
        >
          <span v-if="item.icon" class="mr-1.5">{{ item.icon }}</span>
          <span class="hidden sm:inline">{{ item.label }}</span>
          <span class="sm:hidden">{{ item.shortLabel || item.label }}</span>
        </NuxtLink>
        <button
          v-else-if="item.action"
          @click="$emit(item.action)"
          class="btn-secondary flex items-center justify-center text-sm px-3 sm:px-4"
        >
          <span v-if="item.icon" class="mr-1.5">{{ item.icon }}</span>
          <span class="hidden sm:inline">{{ item.label }}</span>
          <span class="sm:hidden">{{ item.shortLabel || item.label }}</span>
        </button>
      </template>

      <!-- Dropdown for additional items -->
      <div v-if="dropdownItems.length > 0" class="relative" ref="dropdownRef">
        <button
          @click="showDropdown = !showDropdown"
          class="btn-secondary flex items-center justify-center text-sm px-3 sm:px-4"
        >
          <span class="hidden sm:inline">More</span>
          <span class="sm:hidden">⋯</span>
          <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <!-- Dropdown Menu -->
        <Transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <div
            v-if="showDropdown"
            class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          >
            <div class="py-1">
              <template v-for="item in dropdownItems" :key="item.to || item.action">
                <NuxtLink
                  v-if="item.to"
                  :to="item.to"
                  @click="showDropdown = false"
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <span v-if="item.icon" class="mr-2">{{ item.icon }}</span>
                  {{ item.label }}
                </NuxtLink>
                <button
                  v-else-if="item.action"
                  @click="$emit(item.action); showDropdown = false"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <span v-if="item.icon" class="mr-2">{{ item.icon }}</span>
                  {{ item.label }}
                </button>
              </template>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  mainNavItems: {
    type: Array,
    default: () => []
  },
  dropdownItems: {
    type: Array,
    default: () => []
  },
  showRefresh: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['refresh', 'logout'])

const showDropdown = ref(false)
const dropdownRef = ref(null)

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

