<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <div>
              <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">Booking Management</h1>
              <p class="text-gray-600 dark:text-gray-400">View and manage all bookings</p>
              <p v-if="walletAddress" class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                Connected: {{ walletAddress }}
              </p>
            </div>
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

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <StatCard
          title="Total Bookings"
          :value="bookingsCount"
          icon="📋"
          color="blue"
        />
        <StatCard
          title="Pending"
          :value="pendingCount"
          icon="⏳"
          color="yellow"
        />
        <StatCard
          title="In Progress"
          :value="inProgressCount"
          icon="🔄"
          color="blue"
        />
        <StatCard
          title="Ready"
          :value="readyCount"
          icon="📦"
          color="purple"
        />
        <StatCard
          title="Picked Up"
          :value="pickedUpCount"
          icon="🚚"
          color="green"
        />
        <StatCard
          title="Delivered"
          :value="deliveredCount"
          icon="✅"
          color="green"
        />
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div class="grid md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Filter by Status</label>
            <select
              v-model="statusFilter"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="ready">Ready</option>
              <option value="picked_up">Picked Up</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Search by Name</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Customer name..."
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date Range</label>
            <input
              v-model="dateFilter"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div class="flex items-end">
            <button
              @click="clearFilters"
              class="w-full btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Bookings Table -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Booking ID
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Service
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date & Time
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="booking in filteredBookings"
                :key="booking.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                @click="openBookingDetail(booking)"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">
                  {{ booking.id.slice(-8) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">{{ booking.name || `${booking.firstName || ''} ${booking.lastName || ''}`.trim() || 'N/A' }}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">{{ booking.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ getServiceName(booking.service) }}<br>
                  <span class="text-gray-500 dark:text-gray-400">{{ booking.numberOfGifts }} gift(s)</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ formatDate(booking.date) }}<br>
                  <span class="text-gray-500 dark:text-gray-400">{{ formatTime(booking.time) }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getPaymentTypeClass(getPaymentType(booking.id))">
                    {{ getPaymentTypeLabel(getPaymentType(booking.id)) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <span :class="getStatusClass(booking.status)">
                      {{ getStatusLabel(booking.status) }}
                    </span>
                    <div
                      v-if="booking.status === 'ready' && booking.readyEmailSentAt"
                      class="relative group"
                      @click.stop
                    >
                      <svg class="w-4 h-4 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        'Ready for pick-up' email sent
                      </span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" @click.stop>
                  <div class="flex items-center gap-2">
                    <select
                      :value="booking.status"
                      @change="updateStatus(booking.id, $event.target.value)"
                      @click.stop
                      class="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="ready">Ready</option>
                      <option value="picked_up">Picked Up</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      v-if="booking.status === 'cancelled' && isRefundEligible(booking)"
                      @click.stop="handleRefund(booking)"
                      class="px-3 py-1 text-xs font-semibold rounded bg-purple-600 dark:bg-purple-700 text-white hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors"
                    >
                      Refund
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredBookings.length === 0" class="p-12 text-center">
          <p class="text-gray-500 dark:text-gray-400 text-lg">No bookings found.</p>
          <p class="text-gray-400 dark:text-gray-500 text-sm mt-2">Try adjusting your filters.</p>
        </div>
      </div>
    </div>

    <!-- Booking Detail Modal -->
    <BookingDetailModal
      v-if="selectedBooking"
      :booking="selectedBooking"
      :pending-status-change="pendingStatusChange.newStatus"
      @close="handleCloseBookingModal"
      @status-updated="handleStatusUpdate"
    />


  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useBookings } from '~/composables/useBookings'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'
import { useGraphQL } from '~/composables/useGraphQL'

definePageMeta({
  layout: false,
  middleware: 'admin'
})

const { updateBookingStatus } = useBookings()
const { disconnect, walletAddress } = useAuth()
const router = useRouter()
const { executeQuery } = useGraphQL()

const bookings = ref([])
const statusFilter = ref('')
const searchQuery = ref('')
const dateFilter = ref('')
const selectedBooking = ref(null)
const transactions = ref([])
const pendingStatusChange = ref({ bookingId: null, newStatus: null })
const loading = ref(false)

const bookingsCount = computed(() => bookings.value.length)

const sortedBookings = computed(() => {
  return [...bookings.value].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`)
    const dateB = new Date(`${b.date} ${b.time}`)
    return dateB.getTime() - dateA.getTime() // Newest first
  })
})

const filteredBookings = computed(() => {
  let filtered = sortedBookings.value

  if (statusFilter.value) {
    filtered = filtered.filter(b => b.status === statusFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(b => {
      const fullName = b.name || `${b.firstName || ''} ${b.lastName || ''}`.trim()
      return fullName.toLowerCase().includes(query) ||
             b.email.toLowerCase().includes(query) ||
             b.phone.includes(query)
    })
  }

  if (dateFilter.value) {
    filtered = filtered.filter(b => b.date === dateFilter.value)
  }

  return filtered
})

const pendingCount = computed(() => bookings.value.filter(b => b.status === 'pending').length)
const inProgressCount = computed(() => bookings.value.filter(b => b.status === 'in_progress').length)
const readyCount = computed(() => bookings.value.filter(b => b.status === 'ready').length)
const pickedUpCount = computed(() => bookings.value.filter(b => b.status === 'picked_up').length)
const deliveredCount = computed(() => bookings.value.filter(b => b.status === 'delivered').length)

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
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
    pending: 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    in_progress: 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    ready: 'px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    picked_up: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    delivered: 'px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300',
    cancelled: 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
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

const getPaymentType = (bookingId) => {
  const transaction = transactions.value.find(t => t.bookingId === bookingId && t.status === 'completed')
  if (!transaction) {
    // Check for pending transactions
    const pendingTransaction = transactions.value.find(t => t.bookingId === bookingId && t.status === 'pending')
    if (pendingTransaction) {
      return pendingTransaction.paymentMethod || 'pending'
    }
    return 'unpaid'
  }
  return transaction.paymentMethod || 'unknown'
}

const getPaymentTypeLabel = (paymentMethod) => {
  const labels = {
    'card': 'Credit Card',
    'usdc': 'USDC',
    'crypto': 'Crypto',
    'pending': 'Pending',
    'unpaid': 'Unpaid',
    'unknown': 'Unknown'
  }
  return labels[paymentMethod] || paymentMethod || 'Unpaid'
}

const getPaymentTypeClass = (paymentMethod) => {
  const classes = {
    'card': 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800',
    'usdc': 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
    'crypto': 'px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800',
    'pending': 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800',
    'unpaid': 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800',
    'unknown': 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800'
  }
  return classes[paymentMethod] || classes.unpaid
}

const fetchTransactions = async () => {
  try {
    const query = `
      query {
        transactions {
          id
          bookingId
          paymentMethod
          status
        }
      }
    `
    const data = await executeQuery(query)
    transactions.value = data.transactions || []
  } catch (error) {
    console.error('Error fetching transactions:', error)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatTime = (time) => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

const updateStatus = async (id, status) => {
  const booking = bookings.value.find(b => b.id === id)
  const wasCancelled = booking?.status === 'cancelled'
  const isCancelling = status === 'cancelled'
  const isChangingToFulfillment = (status === 'picked_up' || status === 'delivered')
  
  // If changing to picked_up or delivered, open the booking detail modal to show confirmation
  if (isChangingToFulfillment) {
    selectedBooking.value = booking
    pendingStatusChange.value = { bookingId: id, newStatus: status }
    // The modal will handle the confirmation when status is changed there
    return
  }
  
  await updateBookingStatus(id, status)
  
  // If admin is cancelling, refresh to show refund button
  if (isCancelling && !wasCancelled) {
    await fetchTransactions()
    // Refresh bookings to get refundEligible flag
    await loadBookings()
  }
}

const isRefundEligible = (booking) => {
  // Check if booking was cancelled before appointment date
  if (booking.status !== 'cancelled') return false
  
  const appointmentDate = new Date(`${booking.date}T${booking.time}`)
  const cancelledDate = booking.updatedAt ? new Date(booking.updatedAt) : new Date()
  
  // Refund eligible if cancelled before appointment date
  if (cancelledDate >= appointmentDate) return false
  
  // Check if there's a completed transaction
  const transaction = transactions.value.find(
    t => t.bookingId === booking.id && t.status === 'completed'
  )
  
  if (!transaction) return false
  
  // Check if already refunded
  if (transaction.status === 'refunded' || transaction.status === 'refund_pending') {
    return false
  }
  
  return true
}

const handleRefund = async (booking) => {
  const customerName = booking.name || `${booking.firstName || ''} ${booking.lastName || ''}`.trim() || 'Customer'
  if (!confirm(`Process refund for ${customerName}? This will refund the payment.`)) {
    return
  }
  
  try {
    // Get transaction for this booking
    const transaction = transactions.value.find(
      t => t.bookingId === booking.id && t.status === 'completed'
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
          bookingId: booking.id,
          transactionId: transaction.id
        }
      })
      
      if (response.success) {
        alert(`Refund processed successfully. Refund ID: ${response.data.refundId}`)
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
          bookingId: booking.id,
          transactionId: transaction.id,
          recipientAddress: recipientAddress
        }
      })
      
      if (response.success) {
        alert(`USDC refund initiated. ${response.data.message}`)
        await fetchTransactions()
      }
    } else {
      alert('Refund not supported for this payment method')
    }
  } catch (error) {
    console.error('Error processing refund:', error)
    alert(error?.data?.message || 'Failed to process refund. Please try again.')
  }
}

const clearFilters = () => {
  statusFilter.value = ''
  searchQuery.value = ''
  dateFilter.value = ''
}

const openBookingDetail = (booking) => {
  selectedBooking.value = booking
}

const handleStatusUpdate = async (bookingId, newStatus) => {
  // Only update if not changing to picked_up or delivered (those are handled by the modal)
  if (newStatus !== 'picked_up' && newStatus !== 'delivered') {
    await updateBookingStatus(bookingId, newStatus)
  }
  selectedBooking.value = null
  await fetchTransactions()
  // Refresh bookings from database
  await loadBookings()
}

const handleCloseBookingModal = () => {
  selectedBooking.value = null
  pendingStatusChange.value = { bookingId: null, newStatus: null }
}

const loadBookings = async () => {
  try {
    loading.value = true
    // Clear bookings first to ensure fresh data
    bookings.value = []
    
    // Add cache-busting timestamp to query
    const timestamp = Date.now()
    const query = `
      query GetBookings_${timestamp} {
        bookings {
          id
          firstName
          lastName
          name
          email
          phone
          service
          date
          time
          address
          numberOfGifts
          status
          createdAt
          updatedAt
          readyEmailSentAt
        }
      }
    `
    console.log('Fetching bookings from database at', new Date().toISOString())
    const data = await executeQuery(query)
    console.log('GraphQL response:', data)
    console.log('Bookings from database:', data?.bookings)
    console.log('Number of bookings returned:', data?.bookings?.length || 0)
    
    // Ensure we set an empty array if no bookings
    bookings.value = Array.isArray(data?.bookings) ? data.bookings : []
    console.log('Final bookings count in component:', bookings.value.length)
    
    // Force reactivity update
    await nextTick()
  } catch (error) {
    console.error('Error loading bookings:', error)
    console.error('Error details:', error)
    bookings.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // Clear any cached data first
  bookings.value = []
  // Force reload from database
  await loadBookings()
  await fetchTransactions()
})


const handleLogout = () => {
  disconnect()
  router.push('/admin/login')
}
</script>

