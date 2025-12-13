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
              <div class="mb-6">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select Inventory Item
                </label>
                <select
                  v-model="selectedItemId"
                  :disabled="saving"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">-- Select an item --</option>
                  <option v-for="item in inventoryItems" :key="item.id" :value="item.id">
                    {{ item.name }} ({{ item.type }}) - {{ item.quantity || 0 }} {{ item.unit || 'each' }}
                  </option>
                </select>
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
import { ref, computed, watch } from 'vue'

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
const packsToReceive = ref(0)
const quantityToReceive = ref(0)
const receivingDate = ref(new Date().toISOString().split('T')[0])
const notes = ref('')
const saving = ref(false)

// Computed: Get selected item
const selectedItem = computed(() => {
  return props.inventoryItems.find(item => item.id === selectedItemId.value) || null
})

// Calculate sqft per roll for wrapping paper
const sqftPerRoll = computed(() => {
  if (!selectedItem.value || selectedItem.value.type !== 'wrapping_paper') return 0
  
  // Try to get from maxArea of first roll
  if (selectedItem.value.rolls && selectedItem.value.rolls.length > 0 && selectedItem.value.rolls[0].maxArea) {
    return selectedItem.value.rolls[0].maxArea
  }
  
  // Fallback: calculate from size and quantity
  if (selectedItem.value.size && selectedItem.value.quantity > 0) {
    const totalSize = parseFloat(selectedItem.value.size)
    if (!isNaN(totalSize) && totalSize > 0) {
      return totalSize / selectedItem.value.quantity
    }
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
      // Calculate total area to add: packs * 4 rolls * sqft per roll
      const totalAreaToAdd = packsToReceive.value * 4 * sqftPerRoll.value
      
      // Distribute area across existing rolls
      // Strategy: fill each roll to maxArea first, then distribute remaining area by increasing quantity
      let remainingAreaToAdd = totalAreaToAdd
      const updatedRolls = selectedItem.value.rolls.map(roll => {
        const currentOnHand = roll.onHand || 0
        const maxArea = roll.maxArea || 0
        const currentQuantity = roll.quantity || 1 // Default to 1 if not set
        
        let newOnHand = currentOnHand
        let newQuantity = currentQuantity
        
        // 1. Fill up to maxArea first
        const spaceAvailableToMax = Math.max(0, maxArea - currentOnHand)
        if (remainingAreaToAdd > 0 && spaceAvailableToMax > 0) {
          const areaToAddToFill = Math.min(remainingAreaToAdd, spaceAvailableToMax)
          newOnHand += areaToAddToFill
          remainingAreaToAdd -= areaToAddToFill
        }
        
        // 2. If there's still remainingAreaToAdd, distribute it by increasing quantity
        if (remainingAreaToAdd > 0 && maxArea > 0) {
          const additionalRollsWorth = Math.floor(remainingAreaToAdd / maxArea)
          newQuantity += additionalRollsWorth
          newOnHand += additionalRollsWorth * maxArea
          remainingAreaToAdd -= additionalRollsWorth * maxArea
        }
        
        // 3. Add any leftover remainingAreaToAdd to the current roll's onHand
        if (remainingAreaToAdd > 0) {
          newOnHand += remainingAreaToAdd
          remainingAreaToAdd = 0
        }
        
        return {
          ...roll,
          onHand: newOnHand,
          quantity: newQuantity,
          // Preserve other fields
        }
      })
      
      // If there's still area remaining after filling all existing rolls,
      // we can't add it (since we're not changing quantity)
      if (remainingAreaToAdd > 0) {
        console.warn(`⚠️ Could not add ${remainingAreaToAdd.toFixed(2)} sqft - all existing rolls are full. Consider adding new rolls separately.`)
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
  }
})
</script>

