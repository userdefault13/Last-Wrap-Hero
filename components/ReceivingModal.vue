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
                Receive Stock
              </h2>
              <button
                @click="close"
                :disabled="saving"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div class="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <!-- Item Selection -->
              <div class="mb-6 relative">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select Inventory Item
                </label>
                <div class="relative">
                  <input
                    ref="searchInputRef"
                    v-model="itemSearchQuery"
                    type="text"
                    :disabled="saving"
                    @focus="handleSearchFocus"
                    @blur="setTimeout(() => showItemDropdown = false, 200)"
                    @input="handleSearchInput"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Search for an item..."
                  />
                  <!-- Dropdown menu for filtered items - using Teleport to escape modal constraints -->
                  <Teleport to="body">
                    <div
                      v-if="showItemDropdown && filteredItems.length > 0"
                      :style="dropdownStyle"
                      class="fixed z-[60] bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-2xl overflow-y-auto"
                    >
                      <div
                        v-for="item in filteredItems"
                        :key="item.id"
                        @mousedown.prevent="selectItem(item)"
                        class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm text-gray-900 dark:text-white"
                      >
                        {{ item.name }} ({{ item.type }}) - {{ item.quantity || 0 }} {{ item.unit || 'each' }}
                      </div>
                    </div>
                    <div
                      v-if="showItemDropdown && filteredItems.length === 0 && itemSearchQuery"
                      :style="dropdownStyle"
                      class="fixed z-[60] bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-2xl"
                    >
                      <div class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        No items found
                      </div>
                    </div>
                  </Teleport>
                </div>
              </div>

              <!-- Receiving Details -->
              <div v-if="selectedItem" class="space-y-6">
                <!-- Wrapping Paper: Packs Input -->
                <div v-if="selectedItem.type === 'wrapping_paper' && selectedItem.rolls && selectedItem.rolls.length > 0">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Number of Packs to Receive
                    <span class="text-xs text-gray-500 dark:text-gray-400">(4 rolls per pack)</span>
                  </label>
                  <input
                    v-model.number="packsToReceive"
                    type="number"
                    step="1"
                    min="0"
                    :disabled="saving"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="0"
                  />
                  <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <div>Total rolls to add: {{ totalRollsToAdd }}</div>
                    <div>Total sqft to add: {{ totalAreaToAdd.toFixed(2) }} sqft</div>
                    <div class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Note: This will add sqft to existing rolls. The item quantity will not change.
                    </div>
                  </div>
                </div>

                <!-- Other Items: Quantity Input -->
                <div v-else>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Quantity to Receive
                  </label>
                  <input
                    v-model.number="quantityToReceive"
                    type="number"
                    step="1"
                    min="0"
                    :disabled="saving"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="0"
                  />
                </div>

                <!-- Receiving Date -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Receiving Date
                  </label>
                  <input
                    v-model="receivingDate"
                    type="date"
                    :disabled="saving"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <!-- Notes -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    v-model="notes"
                    rows="3"
                    :disabled="saving"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Optional notes about this receiving..."
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                @click="close"
                :disabled="saving"
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                @click="saveReceiving"
                :disabled="!canSave || saving"
                class="px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg
                  v-if="saving"
                  class="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>{{ saving ? 'Processing...' : 'Receive Stock' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  inventoryItems: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'received'])

const selectedItemId = ref('')
const itemSearchQuery = ref('')
const showItemDropdown = ref(false)
const searchInputRef = ref(null)
const dropdownStyle = ref({})
const packsToReceive = ref(0)
const quantityToReceive = ref(0)
const receivingDate = ref(new Date().toISOString().split('T')[0])
const notes = ref('')
const saving = ref(false)

// Computed: Get selected item
const selectedItem = computed(() => {
  return props.inventoryItems.find(item => item.id === selectedItemId.value) || null
})

// Computed: Filter items based on search query
const filteredItems = computed(() => {
  if (!itemSearchQuery.value.trim()) {
    return props.inventoryItems
  }
  
  const query = itemSearchQuery.value.toLowerCase()
  return props.inventoryItems.filter(item => {
    const name = (item.name || '').toLowerCase()
    const type = (item.type || '').toLowerCase()
    return name.includes(query) || type.includes(query)
  })
})

// Function to calculate dropdown position
const updateDropdownPosition = () => {
  if (!searchInputRef.value) return
  
  nextTick(() => {
    const inputRect = searchInputRef.value.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const spaceBelow = viewportHeight - inputRect.bottom
    const spaceAbove = inputRect.top
    
    // Calculate max height (70vh or available space, minimum 200px)
    const maxHeight = Math.max(200, Math.min(window.innerHeight * 0.7, Math.max(spaceBelow, spaceAbove) - 20))
    
    // Position dropdown below input by default, or above if not enough space
    let top = inputRect.bottom + 4 // 4px gap
    let maxHeightValue = Math.max(200, Math.min(maxHeight, spaceBelow - 20))
    
    // If not enough space below, position above
    if (spaceBelow < 200 && spaceAbove > spaceBelow) {
      maxHeightValue = Math.max(200, Math.min(maxHeight, spaceAbove - 20))
      top = inputRect.top - maxHeightValue - 4
    }
    
    dropdownStyle.value = {
      top: `${top}px`,
      left: `${inputRect.left}px`,
      width: `${inputRect.width}px`,
      maxHeight: `${maxHeightValue}px`
    }
  })
}

// Function to handle search focus
const handleSearchFocus = () => {
  showItemDropdown.value = true
  updateDropdownPosition()
}

// Function to handle search input
const handleSearchInput = () => {
  showItemDropdown.value = true
  updateDropdownPosition()
  // Clear selection if user starts typing and it doesn't match the selected item
  if (selectedItemId.value) {
    const selectedItem = props.inventoryItems.find(item => item.id === selectedItemId.value)
    const expectedText = selectedItem ? `${selectedItem.name} (${selectedItem.type}) - ${selectedItem.quantity || 0} ${selectedItem.unit || 'each'}` : ''
    if (itemSearchQuery.value !== expectedText) {
      selectedItemId.value = ''
    }
  }
}

// Function to select an item from the dropdown
const selectItem = (item) => {
  selectedItemId.value = item.id
  itemSearchQuery.value = `${item.name} (${item.type}) - ${item.quantity || 0} ${item.unit || 'each'}`
  showItemDropdown.value = false
}

// Calculate sqft per roll for wrapping paper
// The size field represents sqft per roll (e.g., 22 sqft per roll)
const sqftPerRoll = computed(() => {
  if (!selectedItem.value || selectedItem.value.type !== 'wrapping_paper') return 0
  
  // Use the size field directly - it represents sqft per roll
  if (selectedItem.value.size) {
    const sizePerRoll = parseFloat(selectedItem.value.size)
    if (!isNaN(sizePerRoll) && sizePerRoll > 0) {
      return sizePerRoll
    }
  }
  
  // Fallback: try to get from maxArea of first roll if size is not available
  if (selectedItem.value.rolls && selectedItem.value.rolls.length > 0 && selectedItem.value.rolls[0].maxArea) {
    return selectedItem.value.rolls[0].maxArea
  }
  
  return 0
})

const totalRollsToAdd = computed(() => {
  return packsToReceive.value * 4
})

const totalAreaToAdd = computed(() => {
  return packsToReceive.value * 4 * sqftPerRoll.value
})

const canSave = computed(() => {
  if (!selectedItem.value) return false
  
  if (selectedItem.value.type === 'wrapping_paper' && selectedItem.value.rolls && selectedItem.value.rolls.length > 0) {
    return packsToReceive.value > 0
  }
  
  return quantityToReceive.value > 0
})

const close = () => {
  if (saving.value) return
  emit('close')
}

const resetForm = () => {
  selectedItemId.value = ''
  itemSearchQuery.value = ''
  showItemDropdown.value = false
  packsToReceive.value = 0
  quantityToReceive.value = 0
  receivingDate.value = new Date().toISOString().split('T')[0]
  notes.value = ''
}

const saveReceiving = async () => {
  if (!canSave.value || !selectedItem.value) return
  
  saving.value = true
  
  try {
    // Build update payload
    const updateData = {}
    
    if (selectedItem.value.type === 'wrapping_paper' && selectedItem.value.rolls && selectedItem.value.rolls.length > 0) {
      // Calculate number of rolls to add (4 rolls per pack)
      const totalRollsToAdd = packsToReceive.value * 4
      const sizePerRoll = sqftPerRoll.value
      
      if (sizePerRoll <= 0) {
        alert('Unable to determine size per roll. Please check the item configuration.')
        saving.value = false
        return
      }
      
      // Start with existing rolls
      const updatedRolls = selectedItem.value.rolls.map(roll => ({ ...roll }))
      const existingRollCount = updatedRolls.length
      
      // For each roll being added (4 rolls per pack)
      // Add the size value to each roll's onHand and increase quantity by 1
      for (let i = 0; i < totalRollsToAdd; i++) {
        if (i < existingRollCount) {
          // Add to existing roll: add size value to onHand and increase quantity
          const roll = updatedRolls[i]
          roll.onHand = (roll.onHand || 0) + sizePerRoll
          roll.quantity = (roll.quantity || 1) + 1
        } else {
          // Create a new roll with the size value
          const baseRoll = updatedRolls[0] // Use first roll as template
          const newRollNumber = updatedRolls.length + 1
          
          updatedRolls.push({
            rollNumber: newRollNumber,
            onHand: sizePerRoll,
            maxArea: sizePerRoll, // Use size as maxArea for new rolls
            quantity: 1,
            image: baseRoll.image || null,
            printName: baseRoll.printName || null,
            hasReverseSide: baseRoll.hasReverseSide || false,
            pairedRollNumber: baseRoll.pairedRollNumber || null,
          })
        }
      }
      
      updateData.rolls = updatedRolls
    } else {
      // Update quantity for non-roll items
      updateData.quantity = (selectedItem.value.quantity || 0) + quantityToReceive.value
    }
    
    // Add notes if provided (append to existing notes)
    if (notes.value.trim()) {
      const dateStr = receivingDate.value || new Date().toISOString().split('T')[0]
      const receivingNote = `\n\n[Received on ${dateStr}]: ${notes.value.trim()}`
      updateData.notes = (selectedItem.value.notes || '') + receivingNote
    }
    
    // Emit the receiving data for parent to handle
    emit('received', {
      item: selectedItem.value,
      updateData,
      receivingDate: receivingDate.value,
      notes: notes.value
    })
    
    resetForm()
  } catch (error) {
    console.error('Error saving receiving:', error)
    alert('Failed to save receiving. Please try again.')
  } finally {
    saving.value = false
  }
}

// Reset form when modal closes
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    resetForm()
    saving.value = false
    showItemDropdown.value = false
  } else {
    // Update dropdown position when modal opens
    nextTick(() => {
      if (showItemDropdown.value) {
        updateDropdownPosition()
      }
    })
  }
})

// Watch for dropdown visibility to update position
watch(showItemDropdown, (isVisible) => {
  if (isVisible) {
    updateDropdownPosition()
    // Add event listeners for position updates
    window.addEventListener('resize', updateDropdownPosition)
    window.addEventListener('scroll', updateDropdownPosition, true)
  } else {
    // Remove event listeners
    window.removeEventListener('resize', updateDropdownPosition)
    window.removeEventListener('scroll', updateDropdownPosition, true)
  }
})
</script>


