<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Navigation -->
    <nav class="fixed w-full top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <Logo :show-text="true" />
          </div>
          <div class="hidden md:flex items-center space-x-8">
            <NuxtLink to="/" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">Home</NuxtLink>
            <NuxtLink to="/services" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">Services</NuxtLink>
            <NuxtLink to="/selection" class="text-primary-600 dark:text-primary-400 font-semibold">Selection</NuxtLink>
            <NuxtLink to="/about" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">About</NuxtLink>
          </div>
          <div class="flex items-center gap-4">
            <DarkModeToggle />
            <button @click="openBookingModal" class="btn-primary text-sm">Book Now</button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="text-5xl font-bold text-gray-900 dark:text-white mb-6">Our Wrapping Paper Selection</h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Browse our beautiful collection of wrapping paper available for your gifts
        </p>
      </div>
    </section>

    <!-- Search and Filter Section -->
    <section class="section-padding bg-white dark:bg-gray-800">
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
          <p class="text-gray-500 dark:text-gray-400">Loading wrapping paper selection...</p>
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
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div
            v-for="item in filteredWrappingPaper"
            :key="item.id"
            @click="openItemModal(item)"
            class="group relative bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
          >
            <!-- Image -->
            <div class="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                v-if="getItemImage(item)"
                :src="getItemImage(item)"
                :alt="item.name"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                @error="handleImageError"
                loading="lazy"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-16 h-16 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            <!-- Content -->
            <div class="p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {{ item.name }}
              </h3>
              
              <!-- Print Names -->
              <div v-if="getPrintNames(item).length > 0" class="mb-2">
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Available prints:</p>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="(printName, idx) in getPrintNames(item).slice(0, 3)"
                    :key="idx"
                    class="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded"
                  >
                    {{ printName }}
                  </span>
                  <span
                    v-if="getPrintNames(item).length > 3"
                    class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded"
                  >
                    +{{ getPrintNames(item).length - 3 }} more
                  </span>
                </div>
              </div>
              
              <!-- Availability Info -->
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">
                  <span v-if="item.remainingArea !== null && item.remainingArea !== undefined">
                    {{ item.remainingArea.toFixed(1) }} sqft available
                  </span>
                  <span v-else-if="item.size">
                    {{ item.size }}
                  </span>
                </span>
                <span
                  :class="[
                    'px-2 py-1 text-xs font-semibold rounded-full',
                    getAvailabilityClass(item)
                  ]"
                >
                  {{ getAvailabilityStatus(item) }}
                </span>
              </div>
            </div>
            
            <!-- Hover Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div class="absolute bottom-0 left-0 right-0 p-4 text-white">
                <p class="text-sm font-semibold">{{ item.name }}</p>
                <p v-if="item.supplier" class="text-xs text-white/80 mt-1">Supplier: {{ item.supplier }}</p>
              </div>
            </div>
          </div>
        </div>
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

    <!-- Item Detail Modal -->
    <div
      v-if="selectedItem"
      @click="closeItemModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
    >
      <button
        @click="closeItemModal"
        class="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div @click.stop class="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <div class="grid md:grid-cols-2 gap-6 p-6">
          <!-- Image Gallery -->
          <div class="space-y-4">
            <!-- Main Image -->
            <div class="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
              <img
                v-if="selectedRollImage || getItemImage(selectedItem)"
                :src="selectedRollImage || getItemImage(selectedItem)"
                :alt="selectedItem.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-24 h-24 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            <!-- Roll Images Gallery (if multiple rolls with images) -->
            <div v-if="selectedItem.rolls && selectedItem.rolls.filter(r => r.image).length > 1" class="grid grid-cols-4 gap-2">
              <div
                v-for="roll in selectedItem.rolls.filter(r => r.image)"
                :key="roll.rollNumber"
                @click="selectedRollImage = roll.image"
                class="aspect-square overflow-hidden rounded border-2 cursor-pointer transition-all"
                :class="selectedRollImage === roll.image ? 'border-primary-500' : 'border-gray-200 dark:border-gray-600'"
              >
                <img
                  :src="roll.image"
                  :alt="roll.printName || `Roll ${roll.rollNumber}`"
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          
          <!-- Details -->
          <div class="space-y-4">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white">{{ selectedItem.name }}</h2>
            
            <div v-if="selectedItem.supplier" class="text-gray-600 dark:text-gray-400">
              <span class="font-semibold">Supplier:</span> {{ selectedItem.supplier }}
            </div>
            
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-gray-600 dark:text-gray-400">Size:</span>
                <span class="font-semibold text-gray-900 dark:text-white">
                  {{ selectedItem.size || 'N/A' }}
                </span>
              </div>
              <div v-if="selectedItem.remainingArea !== null && selectedItem.remainingArea !== undefined" class="flex items-center justify-between">
                <span class="text-gray-600 dark:text-gray-400">Available:</span>
                <span class="font-semibold text-gray-900 dark:text-white">
                  {{ selectedItem.remainingArea.toFixed(1) }} sqft
                </span>
              </div>
              <div v-if="selectedItem.totalArea" class="flex items-center justify-between">
                <span class="text-gray-600 dark:text-gray-400">Total Area:</span>
                <span class="font-semibold text-gray-900 dark:text-white">
                  {{ selectedItem.totalArea.toFixed(1) }} sqft
                </span>
              </div>
            </div>
            
            <!-- Print Names -->
            <div v-if="getPrintNames(selectedItem).length > 0">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Available Prints:</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(printName, idx) in getPrintNames(selectedItem)"
                  :key="idx"
                  class="px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded"
                >
                  {{ printName }}
                </span>
              </div>
            </div>
            
            <!-- Rolls Info -->
            <div v-if="selectedItem.rolls && selectedItem.rolls.length > 0">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Rolls ({{ selectedItem.rolls.length }}):</h3>
              <div class="space-y-3">
                <div
                  v-for="roll in selectedItem.rolls"
                  :key="roll.rollNumber"
                  class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-gray-900 dark:text-white">Roll {{ roll.rollNumber }}</span>
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                      {{ roll.onHand.toFixed(1) }} / {{ roll.maxArea.toFixed(1) }} sqft
                    </span>
                  </div>
                  
                  <!-- Roll Image -->
                  <div v-if="roll.image" class="mb-2 rounded overflow-hidden bg-white dark:bg-gray-800">
                    <img
                      :src="roll.image"
                      :alt="roll.printName || `Roll ${roll.rollNumber}`"
                      class="w-full h-32 object-cover"
                      @error="handleImageError"
                    />
                  </div>
                  
                  <div v-if="roll.printName" class="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Print: {{ roll.printName }}
                  </div>
                  <div v-if="roll.hasReverseSide" class="text-xs text-primary-600 dark:text-primary-400 mt-1">
                    ✓ Reversible
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="selectedItem.notes" class="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ selectedItem.notes }}</p>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BookingModal from '~/components/BookingModal.vue'
import DarkModeToggle from '~/components/DarkModeToggle.vue'
import Logo from '~/components/Logo.vue'
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

const wrappingPaper = ref([])
const loading = ref(false)
const error = ref(null)
const selectedItem = ref(null)
const selectedRollImage = ref(null) // Track selected roll image in modal
const isBookingModalOpen = ref(false)
const searchQuery = ref('')
const isLoadingRef = ref(false) // Prevent duplicate loads

// Filter wrapping paper based on search query
const filteredWrappingPaper = computed(() => {
  if (!searchQuery.value.trim()) {
    return wrappingPaper.value
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return wrappingPaper.value.filter(item => {
    const nameMatch = item.name.toLowerCase().includes(query)
    const printNameMatch = getPrintNames(item).some(printName => 
      printName.toLowerCase().includes(query)
    )
    const supplierMatch = item.supplier?.toLowerCase().includes(query)
    
    return nameMatch || printNameMatch || supplierMatch
  })
})

// Get image for an item (prefer roll image, then thumbnail)
const getItemImage = (item) => {
  // Try to get first roll with an image
  if (item.rolls && item.rolls.length > 0) {
    const rollWithImage = item.rolls.find(roll => roll.image)
    if (rollWithImage && rollWithImage.image) {
      return rollWithImage.image
    }
  }
  
  // Fallback to thumbnail
  if (item.thumbnail) {
    return item.thumbnail
  }
  
  return null
}

// Get all print names from an item
const getPrintNames = (item) => {
  const printNames = new Set()
  
  // Add print names from printNames array
  if (item.printNames && Array.isArray(item.printNames)) {
    item.printNames.forEach(name => printNames.add(name))
  }
  
  // Add print names from rolls
  if (item.rolls && Array.isArray(item.rolls)) {
    item.rolls.forEach(roll => {
      if (roll.printName) {
        printNames.add(roll.printName)
      }
    })
  }
  
  return Array.from(printNames)
}

// Get availability status
const getAvailabilityStatus = (item) => {
  if (item.remainingArea !== null && item.remainingArea !== undefined) {
    if (item.remainingArea === 0) {
      return 'Out of Stock'
    }
    if (item.remainingArea < 10) {
      return 'Low Stock'
    }
    return 'In Stock'
  }
  
  if (item.quantity === 0) {
    return 'Out of Stock'
  }
  if (item.quantity < 10) {
    return 'Low Stock'
  }
  return 'In Stock'
}

// Get availability class
const getAvailabilityClass = (item) => {
  const status = getAvailabilityStatus(item)
  if (status === 'Out of Stock') {
    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  }
  if (status === 'Low Stock') {
    return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
  }
  return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
}

// Load wrapping paper from inventory
const loadWrappingPaper = async () => {
  // Prevent duplicate loads
  if (isLoadingRef.value) {
    console.log('⏸️ Load already in progress, skipping...')
    return
  }
  isLoadingRef.value = true
  loading.value = true
  error.value = null
  try {
    // Fetch all inventory and filter client-side (more reliable)
    // Use a unique operation name to avoid query conflicts
    const query = `
      query GetInventorySelection {
        inventory {
          id
          name
          type
          size
          cost
          quantity
          unit
          rollLength
          rollWidth
          remainingArea
          totalArea
          rolls {
            rollNumber
            onHand
            maxArea
            quantity
            image
            printName
            hasReverseSide
            pairedRollNumber
          }
          printNames
          supplier
          thumbnail
          amazonAsin
          amazonUrl
          notes
          createdAt
          updatedAt
        }
      }
    `
    console.log('📦 Fetching wrapping paper inventory...')
    console.log('📦 Full Query:', query)
    console.log('📦 Query length:', query.length)
    console.log('📦 Query contains "inventory":', query.includes('inventory'))
    console.log('📦 Query contains "pricing":', query.includes('pricing'))
    
    // Add timeout wrapper (increased to 30 seconds for large responses with images)
    console.log('⏱️ Starting query execution...')
    // Add a small delay to avoid query batching conflicts with other components
    await new Promise(resolve => setTimeout(resolve, 50))
    const queryPromise = executeQuery(query)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => {
        console.error('Query timeout after 30 seconds')
        reject(new Error('Query timeout after 30 seconds'))
      }, 30000) // Increased timeout for large base64 image data
    )
    
    let data
    try {
      console.log('⏳ Waiting for query response...')
      const result = await Promise.race([queryPromise, timeoutPromise])
      console.log('✅ Query completed, result:', result)
      console.log('✅ Result type:', typeof result)
      console.log('✅ Result keys:', result ? Object.keys(result) : 'null')
      
      // Validate that we got inventory data, not pricing data
      if (result && result.pricing && !result.inventory) {
        console.error('❌ ERROR: Received pricing data instead of inventory data!')
        console.error('❌ This suggests queries are getting mixed up')
        console.error('❌ Result keys:', Object.keys(result))
        console.error('❌ Full result:', JSON.stringify(result, null, 2))
        // Don't throw - try to wait a bit and see if inventory comes through
        console.warn('⚠️ Waiting 100ms to see if inventory data arrives...')
        await new Promise(resolve => setTimeout(resolve, 100))
        // Check again
        if (result && result.pricing && !result.inventory) {
          throw new Error('Received wrong data type: expected inventory, got pricing')
        }
      }
      
      data = result
      console.log('✅ Inventory data received:', data)
      console.log('📊 Data structure:', JSON.stringify(data, null, 2).substring(0, 500))
      if (data && data.inventory) {
        console.log(`📦 Inventory array length: ${data.inventory.length}`)
        console.log('📦 First 3 items:', data.inventory.slice(0, 3).map(item => ({
          id: item.id,
          name: item.name,
          type: item.type,
          quantity: item.quantity,
          remainingArea: item.remainingArea,
          hasRolls: !!item.rolls,
          rollsCount: item.rolls ? item.rolls.length : 0
        })))
        
        // Check wrapping paper items specifically for rolls
        const wrappingPaperItems = data.inventory.filter(item => item.type === 'wrapping_paper')
        if (wrappingPaperItems.length > 0) {
          console.log(`📦 Found ${wrappingPaperItems.length} wrapping paper items in response`)
          wrappingPaperItems.forEach((item, idx) => {
            console.log(`📦 Wrapping paper item ${idx + 1}:`, {
              id: item.id,
              name: item.name,
              hasRolls: !!item.rolls,
              rollsCount: item.rolls ? item.rolls.length : 0,
              rolls: item.rolls ? item.rolls.map(roll => ({
                rollNumber: roll.rollNumber,
                printName: roll.printName,
                hasImage: !!roll.image,
                imageLength: roll.image ? roll.image.length : 0
              })) : null
            })
          })
        }
      } else {
        console.warn('⚠️ No inventory field in data:', data)
      }
    } catch (queryError) {
      console.error('❌ executeQuery failed:', queryError)
      console.error('Error type:', typeof queryError)
      console.error('Error constructor:', queryError?.constructor?.name)
      console.error('Error details:', {
        message: queryError?.message,
        name: queryError?.name,
        stack: queryError?.stack,
        data: queryError?.data,
        errors: queryError?.errors,
        response: queryError?.response,
        status: queryError?.status,
        statusCode: queryError?.statusCode
      })
      throw queryError
    }
    
    if (!data) {
      console.warn('No data in response')
      error.value = 'No data received from server'
      wrappingPaper.value = []
      return
    }
    
    if (!data.inventory) {
      console.warn('No inventory field in response:', data)
      // Try fetching all inventory as fallback
      try {
        const fallbackQuery = `
          query {
            inventory {
              id
              name
              type
              size
              cost
              quantity
              unit
              rollLength
              rollWidth
              remainingArea
              totalArea
              rolls {
                rollNumber
                onHand
                maxArea
                quantity
                image
                printName
                hasReverseSide
                pairedRollNumber
              }
              printNames
              supplier
              thumbnail
              amazonAsin
              amazonUrl
              notes
              createdAt
              updatedAt
            }
          }
        `
        const fallbackData = await executeQuery(fallbackQuery)
        console.log('Fallback inventory data:', fallbackData)
        if (fallbackData && fallbackData.inventory) {
          // Filter client-side for wrapping_paper
          wrappingPaper.value = (fallbackData.inventory || []).filter(item => 
            item.type === 'wrapping_paper'
          )
          console.log('Filtered wrapping paper from fallback:', wrappingPaper.value.length, 'items')
          return
        }
      } catch (fallbackErr) {
        console.error('Fallback query also failed:', fallbackErr)
      }
      
      wrappingPaper.value = []
      error.value = 'No wrapping paper found in inventory'
      return
    }
    
    // Filter for wrapping paper client-side
    const allInventory = data.inventory || []
    console.log(`📋 Total inventory items fetched: ${allInventory.length}`)
    console.log('📋 Inventory types found:', [...new Set(allInventory.map(item => item.type))])
    
    wrappingPaper.value = allInventory.filter(item => item.type === 'wrapping_paper')
    console.log(`📦 Filtered to ${wrappingPaper.value.length} wrapping paper items`)
    
    if (wrappingPaper.value.length > 0) {
      console.log('📦 Wrapping paper items:', wrappingPaper.value.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        remainingArea: item.remainingArea,
        quantity: item.quantity,
        rollsCount: item.rolls ? item.rolls.length : 0,
        rolls: item.rolls ? item.rolls.map(roll => ({
          rollNumber: roll.rollNumber,
          printName: roll.printName,
          hasImage: !!roll.image,
          imagePreview: roll.image ? roll.image.substring(0, 50) + '...' : null
        })) : null
      })))
    }
    
    if (wrappingPaper.value.length === 0) {
      console.warn('No wrapping paper items found after filtering')
      if (allInventory.length === 0) {
        error.value = 'No inventory items found in database'
      } else {
        error.value = 'No wrapping paper available in inventory'
      }
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

const openItemModal = (item) => {
  selectedItem.value = item
  // Set initial selected image to first roll image or main image
  if (item.rolls && item.rolls.length > 0) {
    const firstRollWithImage = item.rolls.find(roll => roll.image)
    selectedRollImage.value = firstRollWithImage ? firstRollWithImage.image : getItemImage(item)
  } else {
    selectedRollImage.value = getItemImage(item)
  }
}

const closeItemModal = () => {
  selectedItem.value = null
  selectedRollImage.value = null
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


