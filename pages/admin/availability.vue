<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">Availability Schedule</h1>
            <p class="text-gray-600 dark:text-gray-400">Set available dates and time slots for bookings</p>
            <p v-if="walletAddress" class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
              Connected: {{ walletAddress }}
            </p>
          </div>
          <div class="flex gap-4">
            <DarkModeToggle />
            <button
              @click="handleLogout"
              class="btn-secondary"
            >
              Logout
            </button>
            <NuxtLink to="/admin/bookings" class="btn-secondary">
              View Bookings
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Worker Selector -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Select Worker
        </label>
        <select
          v-model="selectedWorkerId"
          @change="handleWorkerChange"
          class="w-full md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Global Schedule (All Workers)</option>
          <option v-for="worker in workers" :key="worker.id" :value="worker.id">
            {{ worker.name || worker.walletAddress }} ({{ worker.workerType }})
          </option>
        </select>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Select a worker to manage their individual schedule, or leave as "Global Schedule" for business-wide availability
        </p>
      </div>

      <!-- Recurring Schedule -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Recurring Schedule</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">Set available time slots for each day of the week</p>
        <div class="space-y-3">
          <div
            v-for="(day, index) in daysOfWeek"
            :key="index"
            class="border-2 rounded-lg transition-all"
            :class="[
              expandedDay === index ? 'border-primary-500 dark:border-primary-400 shadow-md' : 'border-gray-200 dark:border-gray-700',
              getDaySchedule(index)?.isBlocked ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800' : ''
            ]"
          >
            <!-- Day Header -->
            <button
              @click="toggleDay(index)"
              class="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">{{ day.emoji }}</span>
                <div class="text-left">
                  <div class="font-semibold text-gray-900 dark:text-white">{{ day.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    <span v-if="getDaySchedule(index)?.isBlocked" class="text-red-600 dark:text-red-400 font-semibold">Blocked</span>
                    <span v-else-if="getDaySchedule(index)?.slots.length" class="text-green-600 dark:text-green-400">
                      {{ getDaySchedule(index)?.slots.length }} time slot(s)
                    </span>
                    <span v-else class="text-gray-400 dark:text-gray-500">No schedule set</span>
                  </div>
                </div>
              </div>
              <svg
                :class="[
                  'w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform',
                  expandedDay === index ? 'transform rotate-180' : ''
                ]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <!-- Expanded Content -->
            <div
              v-if="expandedDay === index"
              class="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4"
            >
              <!-- Block Day Option -->
              <div class="mb-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="getDaySchedule(index)?.isBlocked || false"
                    @change="toggleBlockDay(index, $event.target.checked)"
                    class="w-4 h-4 text-red-600 dark:text-red-400 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500 bg-white dark:bg-gray-700"
                  />
                  <span class="text-sm font-semibold text-red-700 dark:text-red-400">Block this day</span>
                </label>
              </div>

              <!-- Time Slots (only show if not blocked) -->
              <div v-if="!getDaySchedule(index)?.isBlocked">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Available Time Slots
                </label>
                <div class="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label
                    v-for="slot in allTimeSlots"
                    :key="slot"
                    class="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors"
                  >
                    <input
                      type="checkbox"
                      :value="slot"
                      :checked="getDaySchedule(index)?.slots.includes(slot) || false"
                      @change="updateDaySchedule(index, slot, $event.target.checked)"
                      class="rounded border-gray-300 dark:border-gray-600 text-primary-600 dark:text-primary-400 focus:ring-primary-500 bg-white dark:bg-gray-800"
                    />
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ formatTime(slot) }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Availability Form -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Add Specific Date Availability</h2>
        <div class="grid md:grid-cols-4 gap-4">
          <div>
            <label for="schedule-date" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Date *
            </label>
            <input
              id="schedule-date"
              v-model="newAvailability.date"
              type="date"
              :min="minDate"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Available Time Slots *
            </label>
            <div class="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <label
                v-for="slot in allTimeSlots"
                :key="slot"
                class="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors"
              >
                <input
                  type="checkbox"
                  :value="slot"
                  v-model="newAvailability.slots"
                  class="rounded border-gray-300 dark:border-gray-600 text-primary-600 dark:text-primary-400 focus:ring-primary-500 bg-white dark:bg-gray-800"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ formatTime(slot) }}</span>
              </label>
            </div>
          </div>
          <div class="flex items-end">
            <button
              @click="addAvailability"
              :disabled="!canAddAvailability"
              class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <!-- Current Availability -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">Scheduled Availability</h2>
          <button
            v-if="availability.length > 0"
            @click="confirmClearAll"
            class="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold"
          >
            Clear All
          </button>
        </div>

        <div v-if="availability.length === 0" class="p-12 text-center">
          <p class="text-gray-500 dark:text-gray-400 text-lg">No availability scheduled.</p>
          <p class="text-gray-400 dark:text-gray-500 text-sm mt-2">Add dates above to set your schedule.</p>
        </div>

        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="day in sortedAvailability"
            :key="day.date"
            class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {{ formatDate(day.date) }}
                </h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="slot in day.slots"
                    :key="slot"
                    class="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium"
                  >
                    {{ formatTime(slot) }}
                  </span>
                  <span v-if="day.slots.length === 0" class="text-gray-400 dark:text-gray-500 text-sm">
                    No slots available
                  </span>
                </div>
              </div>
              <button
                @click="removeAvailability(day.date)"
                class="ml-4 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Clear All Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showClearConfirm"
          class="fixed inset-0 z-50 overflow-y-auto"
          @click.self="showClearConfirm = false"
        >
          <div class="fixed inset-0 bg-black bg-opacity-50"></div>
          <div class="flex min-h-full items-center justify-center p-4">
            <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Clear All Availability?</h3>
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                This will remove all scheduled availability. This action cannot be undone.
              </p>
              <div class="flex gap-4">
                <button
                  @click="showClearConfirm = false"
                  class="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  @click="handleClearAll"
                  class="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Clear All
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
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useAvailability } from '~/composables/useAvailability'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: false,
  middleware: 'admin'
})

const { 
  availability, 
  setDayAvailability, 
  removeDayAvailability, 
  clearAllAvailability: clearAll,
  setDayOfWeekSchedule,
  getDayOfWeekSchedule,
  dayOfWeekSchedules,
  loadAvailability
} = useAvailability()

// Load workers
const loadWorkers = async () => {
  try {
    const query = `
      query {
        workers {
          id
          name
          walletAddress
          workerType
          availabilityId
        }
      }
    `
    const data = await executeQuery(query)
    workers.value = data.workers || []
  } catch (error) {
    console.error('Error loading workers:', error)
  }
}

// Handle worker change
const handleWorkerChange = async () => {
  // Clear localStorage to force fresh load
  if (typeof window !== 'undefined') {
    const storageKey = selectedWorkerId.value ? `wrapsody-availability-${selectedWorkerId.value}` : 'wrapsody-availability'
    localStorage.removeItem(storageKey)
  }
  
  // Reload availability for selected worker
  await loadAvailability(selectedWorkerId.value || undefined)
  
  // Force reactivity update
  await nextTick()
}

// Force reload availability on mount to ensure fresh data
onMounted(async () => {
  console.log('=== Availability page mounted ===')
  
  // Load workers first
  await loadWorkers()
  
  // Clear localStorage to force fresh load from API
  if (typeof window !== 'undefined') {
    localStorage.removeItem('wrapsody-availability')
    console.log('Cleared localStorage')
  }
  
  // Reload from API (global schedule by default)
  await loadAvailability()
  
  console.log('=== After reload ===')
  console.log('dayOfWeekSchedules.value:', JSON.stringify(dayOfWeekSchedules.value, null, 2))
  console.log('Monday (index 1):', getDaySchedule(1))
  console.log('Saturday (index 6):', getDaySchedule(6))
  
  // Force reactivity update
  await nextTick()
  console.log('After nextTick - dayOfWeekSchedules:', dayOfWeekSchedules.value)
})
const { disconnect, walletAddress } = useAuth()
const router = useRouter()

const expandedDay = ref<number | null>(null)

const newAvailability = ref({
  date: '',
  slots: []
})

const showClearConfirm = ref(false)

// Generate all time slots (6 AM to 6 PM, last booking at 6pm)
const allTimeSlots = Array.from({ length: 13 }, (_, i) => {
  const hour = 6 + i
  return `${hour.toString().padStart(2, '0')}:00`
})

// Days of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
const daysOfWeek = [
  { name: 'Sun', emoji: '☀️' },
  { name: 'Mon', emoji: '📅' },
  { name: 'Tue', emoji: '📆' },
  { name: 'Wed', emoji: '🗓️' },
  { name: 'Thu', emoji: '📋' },
  { name: 'Fri', emoji: '✅' },
  { name: 'Sat', emoji: '🎉' }
]

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const canAddAvailability = computed(() => {
  return newAvailability.value.date && newAvailability.value.slots.length > 0
})

const sortedAvailability = computed(() => {
  return [...availability.value].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })
})

const addAvailability = () => {
  if (!canAddAvailability.value) return

  setDayAvailability(
    newAvailability.value.date,
    newAvailability.value.slots,
    true,
    selectedWorkerId.value || undefined
  )

  // Reset form
  newAvailability.value = {
    date: '',
    slots: []
  }
}

const removeAvailability = (date) => {
  if (confirm(`Remove availability for ${formatDate(date)}?`)) {
    removeDayAvailability(date, selectedWorkerId.value || undefined)
  }
}

const confirmClearAll = () => {
  showClearConfirm.value = true
}

const handleClearAll = () => {
  clearAll(selectedWorkerId.value || undefined)
  showClearConfirm.value = false
}

const toggleDay = (index) => {
  expandedDay.value = expandedDay.value === index ? null : index
}

const getDaySchedule = (dayOfWeek) => {
  // dayOfWeek here is the array index (0-6) which matches JavaScript's getDay()
  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  console.log(`getDaySchedule called with dayOfWeek=${dayOfWeek}`)
  console.log(`All dayOfWeekSchedules:`, JSON.stringify(dayOfWeekSchedules.value, null, 2))
  const schedule = getDayOfWeekSchedule(dayOfWeek)
  console.log(`getDaySchedule(${dayOfWeek}) result:`, schedule)
  return schedule
}

const toggleBlockDay = (dayOfWeek, isBlocked) => {
  const currentSchedule = getDayOfWeekSchedule(dayOfWeek)
  const slots = isBlocked ? [] : (currentSchedule?.slots || [])
  setDayOfWeekSchedule(dayOfWeek, slots, isBlocked, selectedWorkerId.value || undefined)
}

const updateDaySchedule = (dayOfWeek, slot, isSelected) => {
  const currentSchedule = getDayOfWeekSchedule(dayOfWeek)
  let slots = currentSchedule?.slots || []
  
  if (isSelected) {
    if (!slots.includes(slot)) {
      slots = [...slots, slot].sort()
    }
  } else {
    slots = slots.filter(s => s !== slot)
  }
  
  setDayOfWeekSchedule(dayOfWeek, slots, false, selectedWorkerId.value || undefined)
}

const handleLogout = () => {
  disconnect()
  router.push('/admin/login')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (time) => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>

