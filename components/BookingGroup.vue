<template>
  <div 
    class="booking-group mb-4 cursor-pointer" 
    :class="{ 'opacity-90 hover:opacity-100': isPendingCheckIn }"
    @click="handleGroupClick"
  >
    <div 
      class="booking-header rounded-t-lg p-3 border-b transition-colors"
      :class="isPendingCheckIn 
        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30' 
        : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'"
    >
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h4 class="font-semibold text-gray-900 dark:text-white text-sm">
            {{ booking.name }}
          </h4>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {{ booking.id }} • {{ formatDate(booking.date) }} {{ formatTime(booking.time) }}
          </p>
        </div>
        <div class="flex flex-col items-center px-2 py-1 text-xs font-medium rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
          <span class="leading-tight">{{ checkedInItemsCount }}/{{ totalItemsCount }}</span>
          <span class="text-[10px] leading-tight">items</span>
        </div>
      </div>
    </div>
    <div class="booking-items bg-white dark:bg-gray-800 rounded-b-lg border border-gray-200 dark:border-gray-600 border-t-0 p-2 space-y-2">
      <ItemCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        :booking="booking"
        :workers="workers"
        @update-status="handleStatusUpdate"
        @view-details="handleViewDetails"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ItemCard from './ItemCard.vue'

const props = defineProps({
  booking: {
    type: Object,
    required: true
  },
  items: {
    type: Array,
    required: true
  },
  workers: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['status-updated', 'view-details', 'group-click'])

// Calculate checked-in items count (exclude pending_checkin)
const checkedInItemsCount = computed(() => {
  return props.items.filter(item => 
    item.status !== 'pending_checkin' && item.status !== undefined
  ).length
})

// Get total expected items from booking
const totalItemsCount = computed(() => {
  return props.booking.numberOfGifts || props.items.length || 0
})

// Check if this is a pending check-in order (no checked-in items)
const isPendingCheckIn = computed(() => {
  return checkedInItemsCount.value === 0
})

const handleStatusUpdate = (itemId, newStatus) => {
  emit('status-updated', itemId, newStatus)
}

const handleViewDetails = (item) => {
  emit('view-details', item)
}

const handleGroupClick = (event) => {
  // Don't trigger if clicking on item cards or buttons
  if (event.target.closest('.item-card') || event.target.closest('button')) {
    return
  }
  emit('group-click', { booking: props.booking, items: props.items })
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
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
.booking-group {
  @apply rounded-lg overflow-hidden;
}
</style>

