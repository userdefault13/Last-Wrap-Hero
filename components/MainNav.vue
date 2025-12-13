<template>
  <div>
    <nav class="fixed w-full top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center flex-shrink-0">
            <Logo :show-text="true" />
          </div>
          <!-- Desktop Navigation -->
          <nav class="hidden min-[1067px]:flex items-center space-x-8 flex-1 justify-center max-w-2xl mx-8">
            <template v-for="item in navItems" :key="item.key || item.to || item.href">
              <NuxtLink
                v-if="item.to"
                :to="item.to"
                :class="[
                  'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition whitespace-nowrap',
                  item.active ? 'text-primary-600 dark:text-primary-400 font-semibold' : ''
                ]"
              >
                {{ item.label }}
              </NuxtLink>
              <a
                v-else-if="item.href"
                :href="item.href"
                @click.prevent="item.onClick ? item.onClick() : scrollToSection(item.section)"
                :class="[
                  'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition whitespace-nowrap',
                  item.active ? 'text-primary-600 dark:text-primary-400 font-semibold' : ''
                ]"
              >
                {{ item.label }}
              </a>
            </template>
          </nav>
          <!-- Desktop Actions -->
          <div class="hidden min-[1067px]:flex items-center gap-4 flex-shrink-0">
            <DarkModeToggle />
            <button
              v-for="button in desktopButtons"
              :key="button.key || button.label"
              @click="button.onClick"
              :class="[
                'text-sm whitespace-nowrap',
                button.variant === 'primary' ? 'btn-primary' : 'btn-secondary'
              ]"
            >
              {{ button.label }}
            </button>
          </div>
          <!-- Mobile Actions -->
          <div class="flex min-[1067px]:hidden items-center gap-3 flex-shrink-0">
            <DarkModeToggle />
            <button
              @click="toggleMobileMenu"
              class="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
              aria-label="Toggle menu"
            >
              <svg
                v-if="!isMobileMenuOpen"
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                v-else
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Mobile Slide-Out Menu Modal (rendered outside nav for proper stacking) -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-full"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-full"
      >
        <div
          v-if="isMobileMenuOpen"
          class="fixed inset-0 z-[9999] min-[1067px]:hidden"
          @click="closeMobileMenu"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          
          <!-- Slide-out Panel -->
          <div
            @click.stop
            class="absolute right-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 shadow-xl overflow-y-auto"
          >
            <div class="flex flex-col h-full">
              <!-- Menu Header -->
              <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <Logo :show-text="false" />
                <button
                  @click="closeMobileMenu"
                  class="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
                  aria-label="Close menu"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <!-- Menu Items -->
              <nav class="flex-1 p-4 space-y-2">
                <template v-for="item in navItems" :key="item.key || item.to || item.href">
                  <NuxtLink
                    v-if="item.to"
                    :to="item.to"
                    @click="closeMobileMenu"
                    :class="[
                      'block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition',
                      item.active ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 font-semibold' : ''
                    ]"
                  >
                    {{ item.label }}
                  </NuxtLink>
                  <a
                    v-else-if="item.href"
                    :href="item.href"
                    @click.prevent="handleMenuItemClick(item)"
                    :class="[
                      'block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition',
                      item.active ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 font-semibold' : ''
                    ]"
                  >
                    {{ item.label }}
                  </a>
                </template>
              </nav>
              
              <!-- Menu Footer Actions -->
              <div class="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <button
                  v-for="button in mobileButtons"
                  :key="button.key || button.label"
                  @click="handleMobileButtonClick(button)"
                  :class="[
                    'w-full',
                    button.variant === 'primary' ? 'btn-primary' : 'btn-secondary'
                  ]"
                >
                  {{ button.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import Logo from '~/components/Logo.vue'
import DarkModeToggle from '~/components/DarkModeToggle.vue'

const props = defineProps({
  navItems: {
    type: Array,
    default: () => []
  },
  desktopButtons: {
    type: Array,
    default: () => []
  },
  mobileButtons: {
    type: Array,
    default: () => []
  }
})

const route = useRoute()
const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const scrollToSection = (sectionId) => {
  closeMobileMenu()
  setTimeout(() => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80 // Account for fixed nav height
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }, 100)
}

const handleMenuItemClick = (item) => {
  if (item.onClick) {
    item.onClick()
  } else if (item.section) {
    scrollToSection(item.section)
  }
  closeMobileMenu()
}

const handleMobileButtonClick = (button) => {
  if (button.onClick) {
    button.onClick()
  }
  closeMobileMenu()
}

// Close mobile menu on escape key
const handleEscape = (e) => {
  if (e.key === 'Escape' && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape)
})
</script>
