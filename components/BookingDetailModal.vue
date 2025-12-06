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
                      <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ booking.name }}</dd>
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
                      :value="booking.status"
                      @change="handleStatusChange"
                      class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="ready">Ready</option>
                      <option value="completed">Completed</option>
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
import { computed, ref } from 'vue'
import { useGraphQL } from '~/composables/useGraphQL'

const props = defineProps({
  booking: Object
})

const emit = defineEmits(['close', 'status-updated', 'refund-processed'])

const { executeQuery } = useGraphQL()
const transactions = ref([])
const processingRefund = ref(false)

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    ready: 'Ready',
    completed: 'Completed',
    cancelled: 'Cancelled'
  }
  return labels[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    in_progress: 'px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    ready: 'px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    completed: 'px-3 py-1 text-sm font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
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

const handleStatusChange = (event) => {
  const newStatus = event.target.value
  emit('status-updated', props.booking.id, newStatus)
  
  // If cancelling, fetch transactions to check refund eligibility
  if (newStatus === 'cancelled') {
    fetchTransactions()
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

