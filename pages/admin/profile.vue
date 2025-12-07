<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">My Profile</h1>
            <p class="text-gray-600 dark:text-gray-400">Manage your personal availability and profile settings</p>
            <p v-if="walletAddress" class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
              Connected: {{ walletAddress }}
            </p>
          </div>
          <div class="flex gap-2">
            <DarkModeToggle />
            <button
              @click="handleLogout"
              class="relative group btn-secondary flex items-center justify-center w-10 h-10 p-0"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Logout
              </span>
            </button>
            <NuxtLink to="/admin" class="relative group btn-secondary flex items-center justify-center w-10 h-10 p-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Back to Dashboard
              </span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Worker Info Section -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Worker Information</h2>
        <div v-if="worker" class="space-y-4">
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Name</label>
              <p class="text-gray-900 dark:text-white">{{ worker.name || 'Not set' }}</p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Worker Type</label>
              <p class="text-gray-900 dark:text-white">{{ worker.workerType }}</p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <p class="text-gray-900 dark:text-white">{{ worker.email || 'Not set' }}</p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone</label>
              <p class="text-gray-900 dark:text-white">{{ worker.phone || 'Not set' }}</p>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Wallet Address</label>
              <p class="text-gray-500 dark:text-gray-400 font-mono text-sm">{{ worker.walletAddress }}</p>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500 dark:text-gray-400">
          Loading worker information...
        </div>
      </div>

      <!-- My Availability Section -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">My Availability</h2>
            <p class="text-gray-600 dark:text-gray-400">Set your personal availability schedule</p>
          </div>
          <button
            @click="openAvailabilityModal"
            class="btn-primary"
            :disabled="!worker"
          >
            Manage My Availability
          </button>
        </div>
        <p v-if="!worker" class="text-sm text-gray-500 dark:text-gray-400 italic">
          Loading worker information...
        </p>
      </div>
    </div>

    <!-- Availability Modal -->
    <AvailabilityModal
      v-if="worker"
      :is-open="isAvailabilityModalOpen"
      @close="closeAvailabilityModal"
      :workerId="worker.id"
      :is-global="false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'
import { useGraphQL } from '~/composables/useGraphQL'
import AvailabilityModal from '~/components/AvailabilityModal.vue'

definePageMeta({
  layout: false,
  middleware: 'admin'
})

const { disconnect, walletAddress } = useAuth()
const router = useRouter()
const { executeQuery } = useGraphQL()

const worker = ref(null)
const isAvailabilityModalOpen = ref(false)

const loadWorker = async () => {
  if (!walletAddress.value) return
  
  try {
    const query = `
      query {
        worker(walletAddress: "${walletAddress.value}") {
          id
          name
          email
          phone
          walletAddress
          workerType
          availabilityId
        }
      }
    `
    const data = await executeQuery(query)
    worker.value = data.worker
    
    // If worker doesn't exist, create one
    if (!worker.value) {
      const mutation = `
        mutation CreateWorker($input: CreateWorkerInput!) {
          createWorker(input: $input) {
            id
            name
            walletAddress
            workerType
          }
        }
      `
      const createData = await executeQuery(mutation, {
        input: {
          walletAddress: walletAddress.value,
          name: null,
          email: null,
          phone: null
        }
      })
      worker.value = createData.createWorker
    }
  } catch (error) {
    console.error('Error loading worker:', error)
  }
}

const openAvailabilityModal = () => {
  if (worker.value) {
    isAvailabilityModalOpen.value = true
  }
}

const closeAvailabilityModal = () => {
  isAvailabilityModalOpen.value = false
  // Reload worker to get updated availabilityId
  loadWorker()
}

const handleLogout = () => {
  disconnect()
  router.push('/admin/login')
}

onMounted(() => {
  loadWorker()
})
</script>

