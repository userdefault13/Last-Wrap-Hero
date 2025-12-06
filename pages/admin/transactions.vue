<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">Transaction History</h1>
            <p class="text-gray-600 dark:text-gray-400">View and manage all payment transactions</p>
            <p v-if="walletAddress" class="text-xs text-gray-500 dark:text-gray-500 mt-1 font-mono">
              Connected: {{ walletAddress }}
            </p>
          </div>
          <div class="flex gap-2">
            <DarkModeToggle />
            <button
              @click="refreshData"
              :disabled="loading"
              class="relative group btn-secondary flex items-center justify-center w-10 h-10 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg 
                :class="['w-5 h-5 transition-transform', loading ? 'animate-spin' : '']"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {{ loading ? 'Refreshing...' : 'Refresh' }}
              </span>
            </button>
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
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Transactions"
          :value="transactions.length"
          icon="💳"
          color="blue"
        />
        <StatCard
          title="Total Revenue"
          :value="formatCurrency(totalRevenue)"
          icon="💰"
          color="green"
        />
        <StatCard
          title="Card Payments"
          :value="cardPaymentsCount"
          icon="💳"
          color="purple"
        />
        <StatCard
          title="Crypto Payments"
          :value="cryptoPaymentsCount"
          icon="₿"
          color="orange"
        />
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div class="grid md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Filter by Status</label>
            <select
              v-model="statusFilter"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Filter by Payment Method</label>
            <select
              v-model="paymentMethodFilter"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Methods</option>
              <option value="card">Credit Card</option>
              <option value="usdc">USDC</option>
              <option value="crypto">Crypto</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Search by Booking ID</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Booking ID..."
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
        </div>
        <div class="mt-4 flex justify-end">
          <button
            @click="clearFilters"
            class="btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Booking ID
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment Method
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="transaction in filteredTransactions"
                :key="transaction.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">
                  {{ transaction.id.slice(-8) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">
                  <NuxtLink 
                    :to="`/admin/bookings`"
                    class="text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    {{ transaction.bookingId.slice(-8) }}
                  </NuxtLink>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="getBookingForTransaction(transaction.bookingId)" class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ getBookingForTransaction(transaction.bookingId).name }}
                  </div>
                  <div v-if="getBookingForTransaction(transaction.bookingId)" class="text-sm text-gray-500 dark:text-gray-400">
                    {{ getBookingForTransaction(transaction.bookingId).email }}
                  </div>
                  <div v-else class="text-sm text-gray-400 dark:text-gray-500">
                    N/A
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                  {{ formatCurrency(transaction.amount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getPaymentTypeClass(transaction.paymentMethod)">
                    {{ getPaymentTypeLabel(transaction.paymentMethod) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(transaction.status)">
                    {{ transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(transaction.createdAt) }}<br>
                  <span class="text-xs">{{ formatTime(transaction.createdAt) }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="viewTransactionDetails(transaction)"
                    class="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredTransactions.length === 0" class="p-12 text-center">
          <p class="text-gray-500 dark:text-gray-400 text-lg">No transactions found.</p>
          <p class="text-gray-400 dark:text-gray-500 text-sm mt-2">Try adjusting your filters.</p>
        </div>
      </div>
    </div>

    <!-- Transaction Detail Modal -->
    <div
      v-if="selectedTransaction"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="selectedTransaction = null"
    >
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full">
          <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-xl">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Transaction Details</h2>
            <button
              @click="selectedTransaction = null"
              class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-semibold text-gray-500 dark:text-gray-400">Transaction ID</label>
                <p class="text-sm font-mono text-gray-900 dark:text-white">{{ selectedTransaction.id }}</p>
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-500 dark:text-gray-400">Booking ID</label>
                <p class="text-sm font-mono text-gray-900 dark:text-white">{{ selectedTransaction.bookingId }}</p>
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-500 dark:text-gray-400">Amount</label>
                <p class="text-lg font-bold text-gray-900 dark:text-white">{{ formatCurrency(selectedTransaction.amount) }}</p>
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-500 dark:text-gray-400">Currency</label>
                <p class="text-sm text-gray-900 dark:text-white">{{ selectedTransaction.currency }}</p>
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-500 dark:text-gray-400">Payment Method</label>
                <span :class="getPaymentTypeClass(selectedTransaction.paymentMethod)">
                  {{ getPaymentTypeLabel(selectedTransaction.paymentMethod) }}
                </span>
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-500 dark:text-gray-400">Status</label>
                <span :class="getStatusClass(selectedTransaction.status)">
                  {{ selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1) }}
                </span>
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-500 dark:text-gray-400">Created At</label>
                <p class="text-sm text-gray-900 dark:text-white">{{ formatDate(selectedTransaction.createdAt) }} at {{ formatTime(selectedTransaction.createdAt) }}</p>
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-500 dark:text-gray-400">Updated At</label>
                <p class="text-sm text-gray-900 dark:text-white">{{ formatDate(selectedTransaction.updatedAt) }} at {{ formatTime(selectedTransaction.updatedAt) }}</p>
              </div>
              <div v-if="selectedTransaction.paymentIntentId">
                <label class="text-sm font-semibold text-gray-500 dark:text-gray-400">Payment Intent ID</label>
                <p class="text-sm font-mono text-gray-900 dark:text-white">{{ selectedTransaction.paymentIntentId }}</p>
              </div>
            </div>
            <div v-if="selectedTransaction.metadata" class="mt-4">
              <label class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 block">Metadata</label>
              <pre class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-xs overflow-auto max-h-64">{{ JSON.stringify(JSON.parse(selectedTransaction.metadata), null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'
import { useGraphQL } from '~/composables/useGraphQL'
import StatCard from '~/components/StatCard.vue'

definePageMeta({
  layout: false,
  middleware: 'admin'
})

const { disconnect, walletAddress } = useAuth()
const router = useRouter()
const { executeQuery } = useGraphQL()

const loading = ref(true)
const transactions = ref([])
const bookings = ref([])
const selectedTransaction = ref(null)

const statusFilter = ref('')
const paymentMethodFilter = ref('')
const searchQuery = ref('')
const dateFilter = ref('')

// Stats
const totalRevenue = computed(() => {
  return transactions.value
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : parseFloat(t.amount) || 0), 0)
})

const cardPaymentsCount = computed(() => {
  return transactions.value.filter(t => t.paymentMethod === 'card').length
})

const cryptoPaymentsCount = computed(() => {
  return transactions.value.filter(t => t.paymentMethod === 'usdc' || t.paymentMethod === 'crypto').length
})

// Filtered transactions
const filteredTransactions = computed(() => {
  let filtered = transactions.value

  if (statusFilter.value) {
    filtered = filtered.filter(t => t.status === statusFilter.value)
  }

  if (paymentMethodFilter.value) {
    filtered = filtered.filter(t => {
      if (paymentMethodFilter.value === 'usdc') {
        return t.paymentMethod === 'usdc' || t.paymentMethod === 'crypto'
      }
      return t.paymentMethod === paymentMethodFilter.value
    })
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(t =>
      t.bookingId.toLowerCase().includes(query) ||
      t.id.toLowerCase().includes(query)
    )
  }

  if (dateFilter.value) {
    filtered = filtered.filter(t => {
      const txDate = new Date(t.createdAt).toISOString().split('T')[0]
      return txDate === dateFilter.value
    })
  }

  return filtered.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

const getBookingForTransaction = (bookingId) => {
  return bookings.value.find(b => b.id === bookingId)
}

const getPaymentTypeLabel = (paymentMethod) => {
  const labels = {
    'card': 'Credit Card',
    'usdc': 'USDC',
    'crypto': 'Crypto',
    'pending': 'Pending',
    'unknown': 'Unknown'
  }
  return labels[paymentMethod] || paymentMethod || 'Unknown'
}

const getPaymentTypeClass = (paymentMethod) => {
  const classes = {
    'card': 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    'usdc': 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    'crypto': 'px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    'pending': 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    'unknown': 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
  }
  return classes[paymentMethod] || classes.unknown
}

const getStatusClass = (status) => {
  const classes = {
    completed: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    pending: 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    failed: 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    refunded: 'px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
  }
  return classes[status] || classes.pending
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

const clearFilters = () => {
  statusFilter.value = ''
  paymentMethodFilter.value = ''
  searchQuery.value = ''
  dateFilter.value = ''
}

const viewTransactionDetails = (transaction) => {
  selectedTransaction.value = transaction
}

const refreshData = async () => {
  await fetchData()
}

const fetchData = async () => {
  try {
    loading.value = true
    
    // Fetch transactions
    const transactionsQuery = `
      query {
        transactions {
          id
          bookingId
          amount
          currency
          status
          paymentMethod
          paymentIntentId
          metadata
          createdAt
          updatedAt
        }
      }
    `
    const transactionsData = await executeQuery(transactionsQuery)
    transactions.value = transactionsData.transactions || []
    
    // Fetch bookings to get customer info
    const bookingsQuery = `
      query {
        bookings {
          id
          name
          email
        }
      }
    `
    const bookingsData = await executeQuery(bookingsQuery)
    bookings.value = bookingsData.bookings || []
  } catch (error) {
    console.error('Error fetching transaction data:', error)
  } finally {
    loading.value = false
  }
}

const handleLogout = () => {
  disconnect()
  router.push('/admin/login')
}

onMounted(() => {
  fetchData()
})
</script>

