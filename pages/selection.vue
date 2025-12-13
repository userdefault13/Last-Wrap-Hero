<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Navigation -->
    <MainNav
      :nav-items="navItems"
      :desktop-buttons="desktopButtons"
      :mobile-buttons="mobileButtons"
    />

    <!-- Hero Section -->
    <section class="pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="text-5xl font-bold text-gray-900 dark:text-white mb-6">Our Wrapping Paper Selection</h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Browse our beautiful collection of wrapping paper available for your gifts
        </p>
      </div>
      <div class="max-w-7xl mx-auto">
        <div class="mb-6">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search wrapping paper by name or print name..."
            class="w-full max-w-md mx-auto block px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>
    </section>

    <!-- Wrapping Paper Grid -->
    <section class="section-padding bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto">
        <div v-if="loading" class="text-center py-12">
          <div class="flex flex-col items-center justify-center">
            <svg class="animate-spin h-8 w-8 text-primary-600 dark:text-primary-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-gray-500 dark:text-gray-400">Loading wrapping paper selection...</p>
          </div>
        </div>
        <div v-else-if="error" class="text-center py-12">
          <div class="max-w-md mx-auto">
            <svg class="w-24 h-24 mx-auto text-red-400 dark:text-red-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-red-500 dark:text-red-400 text-lg mb-2">Error loading wrapping paper</p>
            <p class="text-gray-400 dark:text-gray-500 text-sm">{{ error }}</p>
            <button @click="loadWrappingPaper" class="mt-4 btn-primary">Try Again</button>
          </div>
        </div>
        <div v-else-if="filteredWrappingPaper.length === 0" class="text-center py-12">
          <div class="max-w-md mx-auto">
            <svg class="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p class="text-gray-500 dark:text-gray-400 text-lg mb-2">No wrapping paper available</p>
            <p class="text-gray-400 dark:text-gray-500 text-sm">Check back soon for our latest selection!</p>
          </div>
        </div>
        <template v-else>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div
              v-for="roll in displayedWrappingPaper"
              :key="roll.id"
              class="group relative bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-md transition-all duration-300"
            >
            <!-- Image with Overlays -->
            <div class="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
              <img
                v-if="getRollImage(roll)"
                :src="getRollImage(roll)"
                :alt="roll.printName || roll.inventoryName"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                @error="handleImageError"
                loading="lazy"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-16 h-16 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              
              <!-- Print Name Overlay (Bottom Left) -->
              <div
                v-if="roll.printName"
                class="absolute bottom-2 left-2 px-2 py-1 bg-gray-200/90 dark:bg-gray-700/90 backdrop-blur-sm rounded text-xs font-medium text-gray-900 dark:text-gray-100"
              >
                {{ roll.printName }}
              </div>
              
              <!-- Status Overlay (Bottom Right) -->
              <div
                class="absolute bottom-2 right-2 px-2 py-1 backdrop-blur-sm rounded text-xs font-semibold"
                :class="[
                  getAvailabilityStatus(roll) === 'Out of Stock' 
                    ? 'bg-red-100/90 dark:bg-red-900/90 text-red-800 dark:text-red-200'
                    : getAvailabilityStatus(roll) === 'Low Stock'
                    ? 'bg-yellow-100/90 dark:bg-yellow-900/90 text-yellow-800 dark:text-yellow-200'
                    : 'bg-green-100/90 dark:bg-green-900/90 text-green-800 dark:text-green-200'
                ]"
              >
                {{ getAvailabilityStatus(roll) }}
              </div>
            </div>
          </div>
          </div>
          
          <!-- Load More / All Done -->
          <div v-if="filteredWrappingPaper.length > 0" class="flex justify-center mt-12">
            <button
              v-if="!allItemsLoaded"
              @click="loadMore"
              class="btn-primary"
            >
              Load More
            </button>
            <p
              v-else
              class="text-gray-500 dark:text-gray-400 text-sm"
            >
              All done
            </p>
          </div>
        </template>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="section-padding bg-primary-600 dark:bg-primary-700">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
        <p class="text-xl text-primary-100 mb-8">Book your wrapping service today and choose from our beautiful selection!</p>
        <div class="flex justify-center">
          <button @click="openBookingModal" class="btn-secondary bg-white text-primary-600 hover:bg-gray-100">
            Book Now
          </button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 dark:bg-black text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <Logo size="lg" :show-text="false" />
            <p class="text-gray-400 mt-4">Your cozy neighborhood<br>gift-wrapping rescue spot</p>
          </div>
          <div>
            <h4 class="font-semibold text-white mb-4">Quick Links</h4>
            <ul class="space-y-2">
              <li><NuxtLink to="/services" class="hover:text-white transition">Services</NuxtLink></li>
              <li><NuxtLink to="/selection" class="hover:text-white transition">Selection</NuxtLink></li>
              <li><NuxtLink to="/about" class="hover:text-white transition">About</NuxtLink></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-white mb-4">Contact</h4>
            <ul class="space-y-2 text-gray-400">
              <li>Long Beach, CA</li>
              <li>Email: lastwraphero@gmail.com</li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Last Wrap Hero. All rights reserved.</p>
        </div>
      </div>
    </footer>

    <!-- Roll Detail Modal -->
    <div
      v-if="selectedRoll"
      @click="closeRollModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
    >
      <button
        @click="closeRollModal"
        class="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div @click.stop class="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <div class="grid md:grid-cols-2 gap-6 p-6">
          <!-- Image -->
          <div class="space-y-4">
            <!-- Main Image -->
            <div class="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
              <img
                v-if="getRollImage(selectedRoll)"
                :src="getRollImage(selectedRoll)"
                :alt="selectedRoll.printName || selectedRoll.inventoryName"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-24 h-24 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Details -->
          <div class="space-y-4">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white">{{ selectedRoll.inventoryName }}</h2>
            
            <div v-if="selectedRoll.printName" class="text-lg text-primary-600 dark:text-primary-400 font-semibold">
              Print: {{ selectedRoll.printName }}
            </div>
            
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Roll {{ selectedRoll.rollNumber }}
            </div>
            
            <div v-if="selectedRoll.supplier" class="text-gray-600 dark:text-gray-400">
              <span class="font-semibold">Supplier:</span> {{ selectedRoll.supplier }}
            </div>
            
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-gray-600 dark:text-gray-400">Available:</span>
                <span class="font-semibold text-gray-900 dark:text-white">
                  {{ selectedRoll.onHand.toFixed(1) }} sqft
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600 dark:text-gray-400">Max Area:</span>
                <span class="font-semibold text-gray-900 dark:text-white">
                  {{ selectedRoll.maxArea.toFixed(1) }} sqft
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600 dark:text-gray-400">Quantity:</span>
                <span class="font-semibold text-gray-900 dark:text-white">
                  {{ selectedRoll.quantity || 'N/A' }}
                </span>
              </div>
              <div v-if="selectedRoll.inventorySize" class="flex items-center justify-between">
                <span class="text-gray-600 dark:text-gray-400">Size per Roll:</span>
                <span class="font-semibold text-gray-900 dark:text-white">
                  {{ selectedRoll.inventorySize }}
                </span>
              </div>
            </div>
            
            <div v-if="selectedRoll.hasReverseSide" class="flex items-center gap-2 text-primary-600 dark:text-primary-400">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>Reversible</span>
            </div>
            
            <div v-if="selectedRoll.notes" class="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ selectedRoll.notes }}</p>
            </div>
            
            <div class="pt-4">
              <button
                @click="openBookingModal"
                class="w-full btn-primary"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Modal -->
    <BookingModal
      :is-open="isBookingModalOpen"
      @close="closeBookingModal"
      @booking-created="handleBookingCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BookingModal from '~/components/BookingModal.vue'
import MainNav from '~/components/MainNav.vue'
import { useGraphQL } from '~/composables/useGraphQL'

// SEO
useHead({
  title: 'Wrapping Paper Selection - Last Wrap Hero',
  meta: [
    { name: 'description', content: 'Browse our beautiful collection of wrapping paper available for your gifts. Choose from a variety of prints and styles.' }
  ]
})

const { executeQuery } = useGraphQL()
const router = useRouter()
const route = useRoute()

const wrappingPaper = ref([]) // Now stores individual rolls with inventory info
const loading = ref(false)
const error = ref(null)
const selectedRoll = ref(null)
const isBookingModalOpen = ref(false)
const searchQuery = ref('')
const isLoadingRef = ref(false) // Prevent duplicate loads
const visibleCount = ref(16) // Number of items to display initially
const itemsPerPage = 16 // Items to load per "Load More" click

// Navigation items for MainNav component
const navItems = computed(() => [
  { key: 'home', label: 'Home', to: '/', active: route.path === '/' },
  { key: 'services', label: 'Services', to: '/services', active: route.path === '/services' },
  { key: 'selection', label: 'Selection', to: '/selection', active: route.path === '/selection' },
  { key: 'about', label: 'About', to: '/about', active: route.path === '/about' }
])

// Desktop buttons for MainNav component
const desktopButtons = computed(() => [
  { key: 'book-now', label: 'Book Now', variant: 'primary', onClick: openBookingModal }
])

// Mobile buttons for MainNav component
const mobileButtons = computed(() => [
  { key: 'book-now', label: 'Book Now', variant: 'primary', onClick: openBookingModal }
])

// Filter wrapping paper based on search query
const filteredWrappingPaper = computed(() => {
  if (!searchQuery.value.trim()) {
    return wrappingPaper.value
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return wrappingPaper.value.filter(roll => {
    const nameMatch = roll.inventoryName?.toLowerCase().includes(query)
    const printNameMatch = roll.printName?.toLowerCase().includes(query)
    const supplierMatch = roll.supplier?.toLowerCase().includes(query)
    
    return nameMatch || printNameMatch || supplierMatch
  })
})

// Display only visible items (paginated)
const displayedWrappingPaper = computed(() => {
  return filteredWrappingPaper.value.slice(0, visibleCount.value)
})

// Check if all items are loaded
const allItemsLoaded = computed(() => {
  return visibleCount.value >= filteredWrappingPaper.value.length
})

// Load more items
const loadMore = () => {
  visibleCount.value += itemsPerPage
}

// Watch for search query changes to reset pagination
watch(searchQuery, () => {
  visibleCount.value = itemsPerPage
})

// Get image for a roll (prefer roll image, then inventory thumbnail)
const getRollImage = (roll) => {
  // Prefer roll's own image
  if (roll.image) {
    return roll.image
  }
  
  // Fallback to inventory thumbnail
  if (roll.inventoryThumbnail) {
    return roll.inventoryThumbnail
  }
  
  return null
}

// Get availability status based on roll's onHand
const getAvailabilityStatus = (roll) => {
  if (roll.onHand === 0) {
    return 'Out of Stock'
  }
  if (roll.onHand < 10) {
    return 'Low Stock'
  }
  return 'In Stock'
}

// Get availability class
const getAvailabilityClass = (roll) => {
  const status = getAvailabilityStatus(roll)
  if (status === 'Out of Stock') {
    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  }
  if (status === 'Low Stock') {
    return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
  }
  return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
}

// Load image on-demand for a specific roll (when modal opens)
const loadRollImage = async (rollId, inventoryId, rollNumber) => {
  try {
    const query = `
      query GetRollImage($inventoryId: ID!, $rollNumber: Int!) {
        roll(inventoryId: $inventoryId, rollNumber: $rollNumber) {
          image
        }
      }
    `
    const data = await executeQuery(query, { inventoryId, rollNumber })
    
    if (data?.roll) {
      // Update the roll with image
      const roll = wrappingPaper.value.find(r => r.id === rollId)
      if (roll && data.roll.image) {
        roll.image = data.roll.image
      }
    }
  } catch (error) {
    console.error('Error loading image for roll:', rollId, error)
  }
}

// Optimized: Load wrapping paper using inventory query directly (much faster, no images initially)
const loadWrappingPaper = async () => {
  if (isLoadingRef.value) {
    console.log('⏸️ Load already in progress, skipping...')
    return
  }
  isLoadingRef.value = true
  loading.value = true
  error.value = null
  
  try {
    // Use inventory query directly - items are already grouped, much more efficient
    // Includes roll images (base64) so they display on cards immediately
    const query = `
      query GetInventorySelection {
        inventory(type: wrapping_paper) {
          id
          name
          type
          size
          cost
          quantity
          unit
          rollLength
          rollWidth
          totalArea
          remainingArea
          printNames
          supplier
          thumbnail
          amazonAsin
          amazonUrl
          notes
          createdAt
          updatedAt
          rolls {
            id
            rollNumber
            onHand
            maxArea
            quantity
            printName
            hasReverseSide
            pairedRollNumber
            image
          }
        }
      }
    `
    
    console.log('📦 Fetching inventory items with roll images...')
    const startTime = Date.now()
    
    const data = await executeQuery(query)
    
    const duration = Date.now() - startTime
    console.log(`✅ Query completed in ${duration}ms`)
    
    if (data?.inventory) {
      // Flatten structure: create a separate card for each roll
      // Each roll gets its inventory info attached for context
      const allRolls = []
      data.inventory.forEach(item => {
        if (item.rolls && item.rolls.length > 0) {
          item.rolls.forEach(roll => {
            allRolls.push({
              // Roll properties
              id: roll.id,
              rollNumber: roll.rollNumber,
              onHand: roll.onHand,
              maxArea: roll.maxArea,
              quantity: roll.quantity,
              printName: roll.printName,
              hasReverseSide: roll.hasReverseSide,
              pairedRollNumber: roll.pairedRollNumber,
              image: roll.image || null, // Roll's image (base64)
              // Inventory context (for display)
              inventoryId: item.id,
              inventoryName: item.name,
              supplier: item.supplier,
              inventorySize: item.size,
              inventoryThumbnail: item.thumbnail,
              notes: item.notes
            })
          })
        }
      })
      
      // Sort by inventory name, then roll number
      wrappingPaper.value = allRolls.sort((a, b) => {
        if (a.inventoryName !== b.inventoryName) {
          return a.inventoryName.localeCompare(b.inventoryName)
        }
        return a.rollNumber - b.rollNumber
      })
      
      console.log(`📦 Loaded ${wrappingPaper.value.length} rolls with images`)
    } else {
      console.warn('⚠️ No inventory field in data:', data)
      wrappingPaper.value = []
      error.value = 'No inventory data received from server'
    }
    
    if (wrappingPaper.value.length === 0) {
      error.value = 'No wrapping paper available'
    }
  } catch (err) {
    console.error('Error loading wrapping paper:', err)
    error.value = err?.message || 'Failed to load wrapping paper. Please try again.'
    wrappingPaper.value = []
  } finally {
    loading.value = false
    isLoadingRef.value = false
  }
}

const handleImageError = (event) => {
  // Replace broken image with placeholder
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage not found%3C/text%3E%3C/svg%3E'
}

const openRollModal = async (roll) => {
  selectedRoll.value = roll
  
  // Load image on-demand when modal opens
  if (!roll.image) {
    console.log('📸 Loading image for roll:', roll.id)
    await loadRollImage(roll.id, roll.inventoryId, roll.rollNumber)
  }
}

const closeRollModal = () => {
  selectedRoll.value = null
}

const openBookingModal = () => {
  isBookingModalOpen.value = true
}

const closeBookingModal = () => {
  isBookingModalOpen.value = false
}

const handleBookingCreated = (bookingData) => {
  console.log('Booking created:', bookingData)
  closeBookingModal()
  // Navigate to confirmation page
  if (bookingData.booking?.id) {
    navigateTo(`/confirmation/${bookingData.booking.id}`)
  }
}

onMounted(() => {
  loadWrappingPaper()
})
</script>


