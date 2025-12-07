<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="close"
      >
        <div class="flex min-h-screen items-center justify-center p-4">
          <div
            class="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                Confirm {{ statusLabel }}
              </h2>
              <button
                @click="close"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div v-if="booking" class="p-6">
              <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Booking Details</h3>
                <div class="space-y-1 text-sm">
                  <p class="text-gray-600 dark:text-gray-400">
                    <span class="font-medium">Customer:</span> {{ booking.name }}
                  </p>
                  <p class="text-gray-600 dark:text-gray-400">
                    <span class="font-medium">Email:</span> {{ booking.email }}
                  </p>
                  <p class="text-gray-600 dark:text-gray-400">
                    <span class="font-medium">Phone:</span> {{ booking.phone }}
                  </p>
                  <p class="text-gray-600 dark:text-gray-400">
                    <span class="font-medium">Date:</span> {{ formatDate(booking.date) }} at {{ formatTime(booking.time) }}
                  </p>
                  <p class="text-gray-600 dark:text-gray-400">
                    <span class="font-medium">Items:</span> {{ booking.numberOfGifts }} gift{{ booking.numberOfGifts !== 1 ? 's' : '' }}
                  </p>
                </div>
              </div>

              <!-- Verification Methods -->
              <div class="mb-6">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  How was receipt verified? <span class="text-red-500">*</span>
                </label>
                <div class="space-y-3">
                  <label class="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all"
                    :class="verificationMethod === 'signature' 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'">
                    <input
                      type="radio"
                      v-model="verificationMethod"
                      value="signature"
                      class="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <div class="flex-1">
                      <span class="font-medium text-gray-900 dark:text-white">Customer Signature</span>
                      <p class="text-sm text-gray-600 dark:text-gray-400">Customer signed a receipt or delivery form</p>
                    </div>
                  </label>

                  <label class="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all"
                    :class="verificationMethod === 'photo' 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'">
                    <input
                      type="radio"
                      v-model="verificationMethod"
                      value="photo"
                      class="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <div class="flex-1">
                      <span class="font-medium text-gray-900 dark:text-white">Photo Evidence</span>
                      <p class="text-sm text-gray-600 dark:text-gray-400">Photo of items at delivery location or with customer</p>
                    </div>
                  </label>

                  <label class="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all"
                    :class="verificationMethod === 'verbal' 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'">
                    <input
                      type="radio"
                      v-model="verificationMethod"
                      value="verbal"
                      class="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <div class="flex-1">
                      <span class="font-medium text-gray-900 dark:text-white">Verbal Confirmation</span>
                      <p class="text-sm text-gray-600 dark:text-gray-400">Customer verbally confirmed receipt over phone or in person</p>
                    </div>
                  </label>

                  <label class="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all"
                    :class="verificationMethod === 'email' 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'">
                    <input
                      type="radio"
                      v-model="verificationMethod"
                      value="email"
                      class="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <div class="flex-1">
                      <span class="font-medium text-gray-900 dark:text-white">Email Confirmation</span>
                      <p class="text-sm text-gray-600 dark:text-gray-400">Customer confirmed receipt via email</p>
                    </div>
                  </label>

                  <label class="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all"
                    :class="verificationMethod === 'self_pickup' 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'">
                    <input
                      type="radio"
                      v-model="verificationMethod"
                      value="self_pickup"
                      class="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <div class="flex-1">
                      <span class="font-medium text-gray-900 dark:text-white">Self Pickup (In-Person)</span>
                      <p class="text-sm text-gray-600 dark:text-gray-400">Customer picked up items in person at your location</p>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Additional Notes -->
              <div class="mb-6">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  v-model="notes"
                  rows="3"
                  placeholder="Any additional information about the delivery/pickup..."
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                ></textarea>
              </div>

              <!-- Photo Upload (if photo method selected) -->
              <div v-if="verificationMethod === 'photo'" class="mb-6">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Upload Photo Evidence
                </label>
                <div class="flex items-center gap-4">
                  <input
                    type="file"
                    ref="photoInput"
                    @change="handlePhotoSelect"
                    accept="image/*"
                    class="hidden"
                  />
                  <button
                    @click="$refs.photoInput?.click()"
                    class="btn-secondary flex items-center gap-2"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ selectedPhoto ? 'Change Photo' : 'Select Photo' }}
                  </button>
                  <div v-if="selectedPhoto" class="flex items-center gap-2">
                    <img :src="photoPreview" alt="Verification photo" class="w-20 h-20 object-cover rounded border border-gray-300 dark:border-gray-600" />
                    <button
                      @click="removePhoto"
                      class="text-red-600 hover:text-red-700"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
              <button @click="close" class="btn-secondary">
                Cancel
              </button>
              <button
                @click="handleConfirm"
                :disabled="!verificationMethod || confirming"
                class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg v-if="!confirming" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ confirming ? 'Confirming...' : 'Confirm ' + statusLabel }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useGraphQL } from '~/composables/useGraphQL'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  booking: {
    type: Object,
    default: null
  },
  newStatus: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'confirmed'])

const { executeQuery } = useGraphQL()
const verificationMethod = ref('')
const notes = ref('')
const selectedPhoto = ref(null)
const photoPreview = ref(null)
const confirming = ref(false)
const photoInput = ref(null)

const statusLabel = computed(() => {
  const labels = {
    picked_up: 'Picked Up',
    delivered: 'Delivered'
  }
  return labels[props.newStatus] || props.newStatus
})

const formatDate = (dateString) => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

const formatTime = (time) => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

const handlePhotoSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    selectedPhoto.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target?.result
    }
    reader.readAsDataURL(file)
  }
}

const removePhoto = () => {
  selectedPhoto.value = null
  photoPreview.value = null
  if (photoInput.value) {
    photoInput.value.value = ''
  }
}

const handleConfirm = async () => {
  if (!verificationMethod.value || !props.booking || !props.newStatus) return

  confirming.value = true
  try {
    // Upload photo if provided
    let photoUrl = null
    if (selectedPhoto.value && verificationMethod.value === 'photo') {
      try {
        const formData = new FormData()
        formData.append('photo', selectedPhoto.value)
        formData.append('type', 'receipt_verification')
        
        const uploadData = await $fetch('/api/upload-photo', {
          method: 'POST',
          body: formData
        })
        photoUrl = uploadData.url
      } catch (error) {
        console.error('Error uploading photo:', error)
        alert('Failed to upload photo. You can still proceed without it.')
      }
    }

    // Update booking status with verification data
    const mutation = `
      mutation UpdateBookingStatus($input: UpdateBookingStatusInput!) {
        updateBookingStatus(input: $input) {
          id
          status
        }
      }
    `
    
    await executeQuery(mutation, {
      input: {
        id: props.booking.id,
        status: props.newStatus,
        receiptVerification: {
          method: verificationMethod.value,
          notes: notes.value || null,
          photoUrl: photoUrl
        }
      }
    })

    emit('confirmed', {
      bookingId: props.booking.id,
      status: props.newStatus,
      verification: {
        method: verificationMethod.value,
        notes: notes.value,
        photoUrl: photoUrl
      }
    })
    close()
  } catch (error) {
    console.error('Error confirming receipt:', error)
    alert('Failed to confirm receipt. Please try again.')
  } finally {
    confirming.value = false
  }
}

const close = () => {
  verificationMethod.value = ''
  notes.value = ''
  removePhoto()
  emit('close')
}

// Reset form when modal closes
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    verificationMethod.value = ''
    notes.value = ''
    removePhoto()
  }
})
</script>

