<template>
  <div class="bg-gradient-to-br from-primary-100 dark:from-dark-800 to-primary-200 dark:to-dark-700 rounded-2xl p-8 shadow-2xl">
    <div class="bg-white dark:bg-dark-900 rounded-lg p-6 shadow-lg">
      <div class="text-center mb-6">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">🎄 Countdown to Christmas</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">Time left to get your gifts wrapped!</p>
      </div>
      
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="text-center">
          <div class="bg-primary-600 dark:bg-dark-600 text-white rounded-lg p-4 mb-2">
            <div class="text-3xl font-bold">{{ days }}</div>
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400 uppercase">Days</div>
        </div>
        <div class="text-center">
          <div class="bg-primary-600 dark:bg-dark-600 text-white rounded-lg p-4 mb-2">
            <div class="text-3xl font-bold">{{ hours }}</div>
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400 uppercase">Hours</div>
        </div>
        <div class="text-center">
          <div class="bg-primary-600 dark:bg-dark-600 text-white rounded-lg p-4 mb-2">
            <div class="text-3xl font-bold">{{ minutes }}</div>
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400 uppercase">Minutes</div>
        </div>
        <div class="text-center">
          <div class="bg-primary-600 dark:bg-dark-600 text-white rounded-lg p-4 mb-2">
            <div class="text-3xl font-bold">{{ seconds }}</div>
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400 uppercase">Seconds</div>
        </div>
      </div>
      
      <div v-if="isPastChristmas" class="text-center text-primary-600 dark:text-primary-400 font-semibold">
        🎉 Merry Christmas! 🎉
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
const isPastChristmas = ref(false)

const getChristmasDate = () => {
  const now = new Date()
  const currentYear = now.getFullYear()
  let christmas = new Date(currentYear, 11, 25) // December 25 (month is 0-indexed)
  
  // If Christmas has passed this year, use next year
  if (now > christmas) {
    christmas = new Date(currentYear + 1, 11, 25)
  }
  
  return christmas
}

const updateCountdown = () => {
  const now = new Date()
  const christmas = getChristmasDate()
  const diff = christmas.getTime() - now.getTime()
  
  if (diff <= 0) {
    isPastChristmas.value = true
    days.value = 0
    hours.value = 0
    minutes.value = 0
    seconds.value = 0
    return
  }
  
  isPastChristmas.value = false
  days.value = Math.floor(diff / (1000 * 60 * 60 * 24))
  hours.value = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  minutes.value = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  seconds.value = Math.floor((diff % (1000 * 60)) / 1000)
}

let interval = null

onMounted(() => {
  updateCountdown()
  interval = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
})
</script>

