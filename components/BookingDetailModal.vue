<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="booking"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="$emit('close')"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            @click.stop
          >
            <!-- Header -->
            <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Booking Details</h2>
              <button
                @click="$emit('close')"
                class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div class="p-6">
              <!-- Booking Info -->
              <div class="space-y-6">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Booking Information</h3>
                  <dl class="grid grid-cols-2 gap-4">
                    <div>
                      <dt class="text-sm text-gray-500 dark:text-gray-400">Booking ID</dt>
                      <dd class="mt-1 text-sm font-mono text-gray-900 dark:text-white">{{ booking.id }}</dd>
                    </div>
                    <div>
                      <dt class="text-sm text-gray-500 dark:text-gray-400">Status</dt>
                      <dd class="mt-1">
                        <span :class="getStatusClass(booking.status)">
                          {{ getStatusLabel(booking.status) }}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt class="text-sm text-gray-500 dark:text-gray-400">Service</dt>
                      <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ getServiceName(booking.service) }}</dd>
                    </div>
                    <div>
                      <dt class="text-sm text-gray-500 dark:text-gray-400">Number of Gifts</dt>
                      <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ booking.numberOfGifts }}</dd>
                    </div>
                    <div>
                      <dt class="text-sm text-gray-500 dark:text-gray-400">Date</dt>
                      <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ formatDate(booking.date) }}</dd>
                    </div>
                    <div>
                      <dt class="text-sm text-gray-500 dark:text-gray-400">Time</dt>
                      <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ formatTime(booking.time) }}</dd>
                    </div>
                    <div class="col-span-2">
                      <dt class="text-sm text-gray-500 dark:text-gray-400">Service Address</dt>
                      <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ booking.address }}</dd>
                    </div>
                  </dl>
                </div>

                <!-- Customer Info -->
                <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h3>
                  <dl class="grid grid-cols-2 gap-4">
                    <div>
                      <dt class="text-sm text-gray-500 dark:text-gray-400">Name</dt>
                      <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ booking.name || `${booking.firstName || ''} ${booking.lastName || ''}`.trim() || 'N/A' }}</dd>
                    </div>
                    <div>
                      <dt class="text-sm text-gray-500 dark:text-gray-400">Phone</dt>
                      <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ booking.phone }}</dd>
                    </div>
                    <div class="col-span-2">
                      <dt class="text-sm text-gray-500 dark:text-gray-400">Email</dt>
                      <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ booking.email }}</dd>
                    </div>
                  </dl>
                </div>

                <!-- Special Instructions -->
                <div v-if="booking.message" class="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Special Instructions</h3>
                  <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ booking.message }}</p>
                </div>

                <!-- Status Update -->
                <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Update Status</h3>
                  <div class="flex gap-4">
                    <select
                      ref="statusSelect"
                      :value="booking.status"
                      @change="handleStatusChange"
                      class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="ready">Ready</option>
                      <option value="picked_up">Picked Up</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      v-if="booking.status === 'cancelled' && isRefundEligible"
                      @click="handleRefund"
                      :disabled="processingRefund"
                      class="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {{ processingRefund ? 'Processing...' : 'Refund' }}
                    </button>
                    <button
                      @click="$emit('close')"
                      class="btn-secondary"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <!-- Receipt Confirmation Form (shown when changing to picked_up or delivered) -->
                <div v-if="showReceiptConfirmation" class="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Confirm {{ pendingStatusLabel }}
                  </h3>
                  
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
                      v-model="verificationNotes"
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

                  <!-- Action Buttons -->
                  <div class="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      @click="cancelReceiptConfirmation"
                      class="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      @click="confirmReceipt"
                      :disabled="!verificationMethod || confirmingReceipt"
                      class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <svg v-if="!confirmingReceipt" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <svg v-else class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {{ confirmingReceipt ? 'Confirming...' : 'Confirm ' + pendingStatusLabel }}
                    </button>
                  </div>
                </div>

                <!-- Created Date -->
                <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p class="text-xs text-gray-400 dark:text-gray-500">
                    Created: {{ formatDateTime(booking.createdAt) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useGraphQL } from '~/composables/useGraphQL'

const props = defineProps({
  booking: Object,
  pendingStatusChange: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'status-updated', 'refund-processed'])

const { executeQuery } = useGraphQL()
const transactions = ref([])
const processingRefund = ref(false)
const showReceiptConfirmation = ref(false)
const pendingStatus = ref(null)
const verificationMethod = ref('')
const verificationNotes = ref('')
const selectedPhoto = ref(null)
const photoPreview = ref(null)
const confirmingReceipt = ref(false)
const photoInput = ref(null)
const statusSelect = ref(null)

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    ready: 'Ready',
    picked_up: 'Picked Up',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  }
  return labels[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    in_progress: 'px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    ready: 'px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    picked_up: 'px-3 py-1 text-sm font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    delivered: 'px-3 py-1 text-sm font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    cancelled: 'px-3 py-1 text-sm font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  }
  return classes[status] || classes.pending
}

const getServiceName = (serviceId) => {
  const services = {
    basic: 'Basic ($8)',
    premium: 'Premium ($12)',
    unlimited: 'Unlimited ($50/hr)'
  }
  return services[serviceId] || serviceId
}

const formatDate = (dateString) => {
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

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const pendingStatusLabel = computed(() => {
  const labels = {
    picked_up: 'Picked Up',
    delivered: 'Delivered'
  }
  return labels[pendingStatus.value] || pendingStatus.value
})

const handleStatusChange = (event) => {
  const newStatus = event.target.value
  const isChangingToFulfillment = (newStatus === 'picked_up' || newStatus === 'delivered')
  
  // If changing to picked_up or delivered, show receipt confirmation (regardless of current status)
  if (isChangingToFulfillment) {
    pendingStatus.value = newStatus
    showReceiptConfirmation.value = true
    return
  }
  
  // Otherwise, update status immediately
  emit('status-updated', props.booking.id, newStatus)
  
  // If cancelling, fetch transactions to check refund eligibility
  if (newStatus === 'cancelled') {
    fetchTransactions()
  }
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

const cancelReceiptConfirmation = () => {
  showReceiptConfirmation.value = false
  pendingStatus.value = null
  verificationMethod.value = ''
  verificationNotes.value = ''
  removePhoto()
  // Reset dropdown to original status
  if (statusSelect.value) {
    statusSelect.value.value = props.booking.status
  }
}

const confirmReceipt = async () => {
  if (!verificationMethod.value || !pendingStatus.value) return

  confirmingReceipt.value = true
  const statusToUpdate = pendingStatus.value // Store before resetting
  
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
        status: statusToUpdate,
        receiptVerification: {
          method: verificationMethod.value,
          notes: verificationNotes.value || null,
          photoUrl: photoUrl
        }
      }
    })

    // Reset form
    showReceiptConfirmation.value = false
    pendingStatus.value = null
    verificationMethod.value = ''
    verificationNotes.value = ''
    removePhoto()

    // Emit status update to parent
    emit('status-updated', props.booking.id, statusToUpdate)
  } catch (error) {
    console.error('Error confirming receipt:', error)
    alert('Failed to confirm receipt. Please try again.')
  } finally {
    confirmingReceipt.value = false
  }
}

const fetchTransactions = async () => {
  try {
    const query = `
      query {
        transactions(bookingId: "${props.booking.id}") {
          id
          bookingId
          paymentMethod
          status
          amount
        }
      }
    `
    const data = await executeQuery(query)
    transactions.value = data.transactions || []
  } catch (error) {
    console.error('Error fetching transactions:', error)
  }
}

const isRefundEligible = computed(() => {
  if (props.booking.status !== 'cancelled') return false
  
  // Check if cancelled before appointment date
  const appointmentDate = new Date(`${props.booking.date}T${props.booking.time}`)
  const cancelledDate = props.booking.updatedAt ? new Date(props.booking.updatedAt) : new Date()
  
  if (cancelledDate >= appointmentDate) return false
  
  // Check if there's a completed transaction
  const transaction = transactions.value.find(
    t => t.status === 'completed'
  )
  
  if (!transaction) return false
  
  // Check if already refunded
  if (transaction.status === 'refunded' || transaction.status === 'refund_pending') {
    return false
  }
  
  return true
})

const handleRefund = async () => {
  if (!confirm(`Process refund for ${props.booking.name}? This will refund the payment.`)) {
    return
  }
  
  processingRefund.value = true
  
  try {
    // Get transaction for this booking
    const transaction = transactions.value.find(
      t => t.status === 'completed'
    )
    
    if (!transaction) {
      alert('No completed transaction found for this booking')
      return
    }
    
    if (transaction.paymentMethod === 'card') {
      // Process Stripe refund
      const response = await $fetch('/api/payments/refund-stripe', {
        method: 'POST',
        body: {
          bookingId: props.booking.id,
          transactionId: transaction.id
        }
      })
      
      if (response.success) {
        alert(`Refund processed successfully. Refund ID: ${response.data.refundId}`)
        emit('refund-processed')
        await fetchTransactions()
      }
    } else if (transaction.paymentMethod === 'usdc') {
      // For USDC, we need recipient address
      const recipientAddress = prompt('Enter recipient wallet address for USDC refund:')
      if (!recipientAddress) {
        return
      }
      
      // Process USDC refund
      const response = await $fetch('/api/payments/refund-usdc', {
        method: 'POST',
        body: {
          bookingId: props.booking.id,
          transactionId: transaction.id,
          recipientAddress: recipientAddress
        }
      })
      
      if (response.success) {
        alert(`USDC refund initiated. ${response.data.message}`)
        emit('refund-processed')
        await fetchTransactions()
      }
    } else {
      alert('Refund not supported for this payment method')
    }
  } catch (error) {
    console.error('Error processing refund:', error)
    alert(error?.data?.message || 'Failed to process refund. Please try again.')
  } finally {
    processingRefund.value = false
  }
}

// Fetch transactions on mount if booking is cancelled
if (props.booking.status === 'cancelled') {
  fetchTransactions()
}

// If modal is opened with a pending status change to picked_up or delivered, show confirmation form
watch(() => props.pendingStatusChange, (newStatus) => {
  if (newStatus === 'picked_up' || newStatus === 'delivered') {
    pendingStatus.value = newStatus
    showReceiptConfirmation.value = true
    // Update the dropdown to reflect the pending status
    if (statusSelect.value) {
      statusSelect.value.value = newStatus
    }
  }
}, { immediate: true })
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

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  opacity: 0;
  transform: scale(0.95);
}
</style>

