import { getDatabase } from '~/server/utils/mongodb'
import { ObjectId } from 'mongodb'

// Helper function to get available time slots for a date
async function getAvailableTimeSlotsForDate(date: string): Promise<string[]> {
  const db = await getDatabase()
  // Parse date string as local date (YYYY-MM-DD format) to avoid timezone issues
  const [year, month, day] = date.split('-').map(Number)
  const dateObj = new Date(year, month - 1, day) // month is 0-indexed
  const dayOfWeek = dateObj.getDay()
  console.log(`getAvailableTimeSlotsForDate for ${date}: Parsed as year=${year}, month=${month}, day=${day}, dayOfWeek=${dayOfWeek} (0=Sunday, 1=Monday, etc.)`)

  // Get availability schedule
  const scheduleDoc = await db.collection('availability').findOne({ type: 'schedule' })
  const dayOfWeekSchedules = scheduleDoc?.dayOfWeekSchedules || []
  const availability = scheduleDoc?.availability || []

  let baseSlots: string[] = []

  // 1. Check day-of-week schedule first
  const daySchedule = dayOfWeekSchedules.find((s: any) => s.dayOfWeek === dayOfWeek)
  if (daySchedule) {
    if (daySchedule.isBlocked) {
      // Day is blocked, return empty array immediately
      return []
    }
    baseSlots = daySchedule.slots || []
  }

  // 2. Override with specific date availability if it exists
  const dayAvailability = availability.find((a: any) => a.date === date)
  if (dayAvailability) {
    if (!dayAvailability.isAvailable) {
      // Specific date is not available, return empty array
      return []
    }
    baseSlots = dayAvailability.slots || []
  }

  // If no specific schedule and no day-of-week schedule, fall back to default (6 AM - 11 PM)
  if (baseSlots.length === 0 && !daySchedule) {
    for (let hour = 6; hour <= 23; hour++) {
      baseSlots.push(`${hour.toString().padStart(2, '0')}:00`)
    }
  }

  // Get bookings for this date to filter out booked slots
  const dayBookings = await db.collection('bookings').find({
    date,
    status: { $ne: 'cancelled' }
  }).toArray()

  const bookedTimes = dayBookings.map((b: any) => b.time)

  // Return available slots that aren't booked
  return baseSlots.filter(slot => !bookedTimes.includes(slot))
}

// Helper function to check if a date is available
async function isDateAvailableCheck(date: string): Promise<boolean> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Parse date string as local date (YYYY-MM-DD format) to avoid timezone issues
  const [year, month, day] = date.split('-').map(Number)
  const selectedDate = new Date(year, month - 1, day) // month is 0-indexed
  selectedDate.setHours(0, 0, 0, 0)

  if (selectedDate < today) {
    console.log(`isDateAvailableCheck for ${date}: Date is in the past. Returning false.`)
    return false
  }

  const db = await getDatabase()
  // Use the same local date parsing to get correct dayOfWeek
  const dateObj = new Date(year, month - 1, day)
  const dayOfWeek = dateObj.getDay()
  console.log(`isDateAvailableCheck for ${date}: Parsed as year=${year}, month=${month}, day=${day}, dayOfWeek=${dayOfWeek} (0=Sunday, 1=Monday, etc.)`)

  // Get availability schedule
  const scheduleDoc = await db.collection('availability').findOne({ type: 'schedule' })
  const dayOfWeekSchedules = scheduleDoc?.dayOfWeekSchedules || []
  const availability = scheduleDoc?.availability || []

  // 1. Check day-of-week schedule first
  const daySchedule = dayOfWeekSchedules.find((s: any) => s.dayOfWeek === dayOfWeek)
  if (daySchedule) {
    if (daySchedule.isBlocked) {
      console.log(`Date ${date} (dayOfWeek ${dayOfWeek}) is blocked`)
      return false
    }
    if (daySchedule.slots.length > 0) {
      const slots = await getAvailableTimeSlotsForDate(date)
      console.log(`Date ${date} (dayOfWeek ${dayOfWeek}) has ${slots.length} available slots`)
      return slots.length > 0
    }
    console.log(`Date ${date} (dayOfWeek ${dayOfWeek}) has no slots configured`)
    return false
  }

  // 2. Check specific date availability
  const dayAvailability = availability.find((a: any) => a.date === date)
  if (dayAvailability) {
    if (dayAvailability.isAvailable && dayAvailability.slots.length > 0) {
      const slots = await getAvailableTimeSlotsForDate(date)
      return slots.length > 0
    }
    return false
  }

  // 3. Default: check if date has available slots
  const slots = await getAvailableTimeSlotsForDate(date)
  console.log(`Date ${date} (dayOfWeek ${dayOfWeek}) - no schedule found, using default slots: ${slots.length}`)
  return slots.length > 0
}

export const resolvers = {
  User: {
    transactionHistory: async (parent: any) => {
      try {
        const db = await getDatabase()
        if (!parent.id) {
          return []
        }

        const transactions = await db.collection('transactions')
          .find({ userId: parent.id })
          .sort({ createdAt: -1 })
          .toArray()

        return transactions.map((tx: any) => ({
          ...tx,
          amount: tx.amount ? (tx.amount / 100) : 0,
          metadata: tx.metadata ? JSON.stringify(tx.metadata) : null
        }))
      } catch (error: any) {
        console.error('Error fetching user transaction history:', error)
        return []
      }
    }
  },

  Query: {
    bookings: async (_: any, args: { status?: string; date?: string }) => {
      const db = await getDatabase()
      const query: any = {}

      if (args.status) {
        query.status = args.status
      }
      if (args.date) {
        query.date = args.date
      }

      const bookings = await db.collection('bookings')
        .find(query)
        .sort({ createdAt: -1 })
        .toArray()

      // Map legacy "confirmed" status to "pending" for GraphQL compatibility
      return bookings.map((booking: any) => ({
        ...booking,
        status: booking.status === 'confirmed' ? 'pending' : booking.status
      }))
    },

    booking: async (_: any, args: { id: string }) => {
      const db = await getDatabase()
      let booking = await db.collection('bookings').findOne({ id: args.id })

      if (!booking && ObjectId.isValid(args.id)) {
        booking = await db.collection('bookings').findOne({
          _id: new ObjectId(args.id)
        })
      }

      if (!booking) {
        throw new Error('Booking not found')
      }

      // Map legacy "confirmed" status to "pending" for GraphQL compatibility
      return {
        ...booking,
        status: booking.status === 'confirmed' ? 'pending' : booking.status
      }
    },

    availability: async () => {
      const db = await getDatabase()
      const availability = await db.collection('availability').findOne({
        type: 'schedule'
      })

      return availability || {
        availability: [],
        dayOfWeekSchedules: [],
        updatedAt: new Date().toISOString()
      }
    },

    availableTimeSlots: async (_: any, args: { date: string }) => {
      return getAvailableTimeSlotsForDate(args.date)
    },

    isDateAvailable: async (_: any, args: { date: string }) => {
      return isDateAvailableCheck(args.date)
    },

    pricing: async (_: any, args: { active?: boolean; group?: string; serviceCategory?: string }) => {
      try {
        const db = await getDatabase()
        const query: any = {}

        if (args.active !== undefined) {
          query.active = args.active
        }
        if (args.group) {
          query.group = args.group
        }
        if (args.serviceCategory) {
          query.serviceCategory = args.serviceCategory
        }

        const pricing = await db.collection('pricing')
          .find(query)
          .sort({ order: 1, createdAt: 1 })
          .toArray()

        console.log(`Fetched ${pricing.length} pricing items from database`)
        return pricing
      } catch (error: any) {
        console.error('Error in pricing query:', error)
        throw new Error(`Failed to fetch pricing: ${error.message}`)
      }
    },

    pricingItem: async (_: any, args: { id: string }) => {
      const db = await getDatabase()
      let pricing = await db.collection('pricing').findOne({ id: args.id })

      if (!pricing && ObjectId.isValid(args.id)) {
        pricing = await db.collection('pricing').findOne({
          _id: new ObjectId(args.id)
        })
      }

      if (!pricing) {
        throw new Error('Pricing item not found')
      }

      return pricing
    },

    services: async (_: any, args: { active?: boolean; category?: string }) => {
      try {
        const db = await getDatabase()
        const query: any = {}

        if (args.active !== undefined) {
          query.active = args.active
        }
        if (args.category) {
          query.category = args.category
        }

        const services = await db.collection('services')
          .find(query)
          .sort({ order: 1, createdAt: 1 })
          .toArray()

        console.log(`Fetched ${services.length} services from database`)
        return services
      } catch (error: any) {
        console.error('Error in services query:', error)
        throw new Error(`Failed to fetch services: ${error.message}`)
      }
    },

    service: async (_: any, args: { id: string }) => {
      const db = await getDatabase()
      let service = await db.collection('services').findOne({ id: args.id })

      if (!service && ObjectId.isValid(args.id)) {
        service = await db.collection('services').findOne({
          _id: new ObjectId(args.id)
        })
      }

      if (!service) {
        throw new Error('Service not found')
      }

      return service
    },

    transactions: async (_: any, args: { bookingId?: string; status?: string; paymentMethod?: string; userId?: string }) => {
      const db = await getDatabase()
      const query: any = {}

      if (args.bookingId) {
        query.bookingId = args.bookingId
      }
      if (args.status) {
        query.status = args.status
      }
      if (args.paymentMethod) {
        query.paymentMethod = args.paymentMethod
      }
      if (args.userId) {
        query.userId = args.userId
      }

      const transactions = await db.collection('transactions')
        .find(query)
        .sort({ createdAt: -1 })
        .toArray()

      return transactions.map((tx: any) => ({
        ...tx,
        // Amount is stored in cents in DB, convert to dollars for GraphQL response
        amount: tx.amount ? (tx.amount / 100) : 0,
        metadata: tx.metadata ? JSON.stringify(tx.metadata) : null
      }))
    },

    transaction: async (_: any, args: { id: string }) => {
      const db = await getDatabase()
      let transaction = await db.collection('transactions').findOne({ id: args.id })
      if (!transaction && ObjectId.isValid(args.id)) {
        transaction = await db.collection('transactions').findOne({ _id: new ObjectId(args.id) })
      }
      if (!transaction) {
        throw new Error('Transaction not found')
      }
      return {
        ...transaction,
        // Amount is stored in cents in DB, convert to dollars for GraphQL response
        amount: transaction.amount ? (transaction.amount / 100) : 0,
        metadata: transaction.metadata ? JSON.stringify(transaction.metadata) : null
      }
    },

    inventory: async (_: any, args: { type?: string }) => {
      try {
        const db = await getDatabase()
        const query: any = {}

        if (args.type) {
          query.type = args.type
        }

        const inventory = await db.collection('inventory')
          .find(query)
          .sort({ type: 1, name: 1, createdAt: -1 })
          .toArray()

        return inventory
      } catch (error: any) {
        console.error('Error in inventory query:', error)
        throw new Error(`Failed to fetch inventory: ${error.message}`)
      }
    },

    inventoryItem: async (_: any, args: { id: string }) => {
      const db = await getDatabase()
      let item = await db.collection('inventory').findOne({ id: args.id })

      if (!item && ObjectId.isValid(args.id)) {
        item = await db.collection('inventory').findOne({ _id: new ObjectId(args.id) })
      }

      if (!item) {
        throw new Error('Inventory item not found')
      }

      return item
    },

    users: async (_: any, args: { email?: string; walletAddress?: string; role?: string }) => {
      try {
        const db = await getDatabase()
        const query: any = {}

        if (args.email) {
          query.email = args.email
        }
        if (args.walletAddress) {
          query.walletAddress = args.walletAddress
        }
        if (args.role) {
          query.role = args.role
        }

        const users = await db.collection('users')
          .find(query)
          .sort({ createdAt: -1 })
          .toArray()

        return users
      } catch (error: any) {
        console.error('Error in users query:', error)
        throw new Error(`Failed to fetch users: ${error.message}`)
      }
    },

    user: async (_: any, args: { id?: string; email?: string; walletAddress?: string }) => {
      try {
        const db = await getDatabase()
        let user = null

        if (args.id) {
          user = await db.collection('users').findOne({ id: args.id })
          if (!user && ObjectId.isValid(args.id)) {
            user = await db.collection('users').findOne({ _id: new ObjectId(args.id) })
          }
        } else if (args.email) {
          user = await db.collection('users').findOne({ email: args.email })
        } else if (args.walletAddress) {
          user = await db.collection('users').findOne({ walletAddress: args.walletAddress })
        }

        if (!user) {
          throw new Error('User not found')
        }

        return user
      } catch (error: any) {
        console.error('Error in user query:', error)
        throw new Error(`Failed to fetch user: ${error.message}`)
      }
    },

    workers: async (_: any, args: { workerType?: string }) => {
      try {
        const db = await getDatabase()
        const query: any = {}

        if (args.workerType) {
          query.workerType = args.workerType
        }

        const workers = await db.collection('workers')
          .find(query)
          .sort({ createdAt: -1 })
          .toArray()

        return workers
      } catch (error: any) {
        console.error('Error in workers query:', error)
        throw new Error(`Failed to fetch workers: ${error.message}`)
      }
    },

    worker: async (_: any, args: { id?: string; walletAddress?: string }) => {
      try {
        const db = await getDatabase()
        let worker = null

        if (args.id) {
          worker = await db.collection('workers').findOne({ id: args.id })
          if (!worker && ObjectId.isValid(args.id)) {
            worker = await db.collection('workers').findOne({ _id: new ObjectId(args.id) })
          }
        } else if (args.walletAddress) {
          worker = await db.collection('workers').findOne({ walletAddress: args.walletAddress })
        }

        if (!worker) {
          throw new Error('Worker not found')
        }

        return worker
      } catch (error: any) {
        console.error('Error in worker query:', error)
        throw new Error(`Failed to fetch worker: ${error.message}`)
      }
    }
  },

  Mutation: {
    createBooking: async (_: any, args: { input: any }) => {
      const db = await getDatabase()

      // Check if date/time is available
      const isAvailable = await isDateAvailableCheck(args.input.date)
      if (!isAvailable) {
        throw new Error('Selected date is not available')
      }

      const slots = await getAvailableTimeSlotsForDate(args.input.date)
      if (!slots.includes(args.input.time)) {
        throw new Error('Selected time slot is not available')
      }

      const booking = {
        ...args.input,
        id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const result = await db.collection('bookings').insertOne(booking)
      return { ...booking, _id: result.insertedId }
    },

    updateBookingStatus: async (_: any, args: { input: { id: string; status: string } }) => {
      const db = await getDatabase()
      const { id, status } = args.input

      // Try to update by id field first
      let result = await db.collection('bookings').updateOne(
        { id },
        { $set: { status, updatedAt: new Date().toISOString() } }
      )

      // If not found, try MongoDB _id
      if (result.matchedCount === 0 && ObjectId.isValid(id)) {
        result = await db.collection('bookings').updateOne(
          { _id: new ObjectId(id) },
          { $set: { status, updatedAt: new Date().toISOString() } }
        )
      }

      if (result.matchedCount === 0) {
        throw new Error('Booking not found')
      }

      // Fetch updated booking
      let booking = await db.collection('bookings').findOne({ id })
      if (!booking && ObjectId.isValid(id)) {
        booking = await db.collection('bookings').findOne({ _id: new ObjectId(id) })
      }

      return booking
    },

    updateAvailability: async (_: any, args: { input: any }) => {
      const db = await getDatabase()
      const schedule = {
        type: 'schedule',
        availability: args.input.availability || [],
        dayOfWeekSchedules: args.input.dayOfWeekSchedules || [],
        updatedAt: new Date().toISOString()
      }

      await db.collection('availability').updateOne(
        { type: 'schedule' },
        { $set: schedule },
        { upsert: true }
      )

      return schedule
    },

    // Pricing mutations (for pricing tiers)
    createPricing: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()

        // Validate required fields
        if (!args.input.name || args.input.price === undefined) {
          throw new Error('Name and price are required')
        }

        // Get current max order
        const maxOrderPricing = await db.collection('pricing')
          .findOne({}, { sort: { order: -1 } })
        const newOrder = maxOrderPricing ? maxOrderPricing.order + 1 : 0

        // Generate unique ID
        const pricingId = `pricing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        const pricing = {
          id: pricingId,
          name: args.input.name,
          description: args.input.description || '',
          price: parseFloat(args.input.price),
          priceType: args.input.priceType || 'per-item',
          features: args.input.features || [],
          group: args.input.group || 'default',
          serviceCategory: args.input.serviceCategory || '',
          active: args.input.active !== false,
          order: args.input.order !== undefined ? parseInt(String(args.input.order)) : newOrder,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        const result = await db.collection('pricing').insertOne(pricing)
        return { ...pricing, _id: result.insertedId }
      } catch (error: any) {
        console.error('Error in createPricing resolver:', error)
        throw new Error(`Failed to create pricing: ${error.message}`)
      }
    },

    updatePricing: async (_: any, args: { input: any }) => {
      const db = await getDatabase()
      const { id, ...updates } = args.input

      const update: any = {
        updatedAt: new Date().toISOString()
      }

      if (updates.name !== undefined) update.name = updates.name
      if (updates.description !== undefined) update.description = updates.description
      if (updates.price !== undefined) update.price = parseFloat(updates.price)
      if (updates.priceType !== undefined) update.priceType = updates.priceType
      if (updates.features !== undefined) update.features = updates.features
      if (updates.group !== undefined) update.group = updates.group
      if (updates.serviceCategory !== undefined) update.serviceCategory = updates.serviceCategory
      if (updates.active !== undefined) update.active = updates.active
      if (updates.order !== undefined) update.order = parseInt(String(updates.order))

      let result = await db.collection('pricing').updateOne(
        { id },
        { $set: update }
      )

      if (result.matchedCount === 0 && ObjectId.isValid(id)) {
        result = await db.collection('pricing').updateOne(
          { _id: new ObjectId(id) },
          { $set: update }
        )
      }

      if (result.matchedCount === 0) {
        throw new Error('Pricing item not found')
      }

      let pricing = await db.collection('pricing').findOne({ id })
      if (!pricing && ObjectId.isValid(id)) {
        pricing = await db.collection('pricing').findOne({ _id: new ObjectId(id) })
      }

      return pricing
    },

    deletePricing: async (_: any, args: { id: string }) => {
      const db = await getDatabase()

      let result = await db.collection('pricing').deleteOne({ id: args.id })

      if (result.deletedCount === 0 && ObjectId.isValid(args.id)) {
        result = await db.collection('pricing').deleteOne({
          _id: new ObjectId(args.id)
        })
      }

      if (result.deletedCount === 0) {
        throw new Error('Pricing item not found')
      }

      return true
    },

    reorderPricing: async (_: any, args: { input: { pricing: Array<{ id: string; order: number }> } }) => {
      const db = await getDatabase()

      const updates = args.input.pricing.map(({ id, order }) =>
        db.collection('pricing').updateOne(
          { id },
          { $set: { order: parseInt(String(order)), updatedAt: new Date().toISOString() } }
        )
      )

      await Promise.all(updates)
      return true
    },

    // Service mutations (for service types)
    createService: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()

        // Validate required fields
        if (!args.input.title) {
          throw new Error('Title is required')
        }

        // Get current max order
        const maxOrderService = await db.collection('services')
          .findOne({}, { sort: { order: -1 } })
        const newOrder = maxOrderService ? maxOrderService.order + 1 : 0

        // Generate unique ID
        const serviceId = `svc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        const service = {
          id: serviceId,
          title: args.input.title,
          subtitle: args.input.subtitle || '',
          description: args.input.description || '',
          tag: args.input.tag || '',
          category: args.input.category || '',
          active: args.input.active !== false,
          order: args.input.order !== undefined ? parseInt(String(args.input.order)) : newOrder,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        const result = await db.collection('services').insertOne(service)
        return { ...service, _id: result.insertedId }
      } catch (error: any) {
        console.error('Error in createService resolver:', error)
        throw new Error(`Failed to create service: ${error.message}`)
      }
    },

    updateService: async (_: any, args: { input: any }) => {
      const db = await getDatabase()
      const { id, ...updates } = args.input

      const update: any = {
        updatedAt: new Date().toISOString()
      }

      if (updates.title !== undefined) update.title = updates.title
      if (updates.subtitle !== undefined) update.subtitle = updates.subtitle
      if (updates.description !== undefined) update.description = updates.description
      if (updates.tag !== undefined) update.tag = updates.tag
      if (updates.category !== undefined) update.category = updates.category
      if (updates.active !== undefined) update.active = updates.active
      if (updates.order !== undefined) update.order = parseInt(String(updates.order))

      let result = await db.collection('services').updateOne(
        { id },
        { $set: update }
      )

      if (result.matchedCount === 0 && ObjectId.isValid(id)) {
        result = await db.collection('services').updateOne(
          { _id: new ObjectId(id) },
          { $set: update }
        )
      }

      if (result.matchedCount === 0) {
        throw new Error('Service not found')
      }

      let service = await db.collection('services').findOne({ id })
      if (!service && ObjectId.isValid(id)) {
        service = await db.collection('services').findOne({ _id: new ObjectId(id) })
      }

      return service
    },

    deleteService: async (_: any, args: { id: string }) => {
      const db = await getDatabase()

      let result = await db.collection('services').deleteOne({ id: args.id })

      if (result.deletedCount === 0 && ObjectId.isValid(args.id)) {
        result = await db.collection('services').deleteOne({
          _id: new ObjectId(args.id)
        })
      }

      if (result.deletedCount === 0) {
        throw new Error('Service not found')
      }

      return true
    },

    reorderServices: async (_: any, args: { input: { services: Array<{ id: string; order: number }> } }) => {
      const db = await getDatabase()

      const updates = args.input.services.map(({ id, order }) =>
        db.collection('services').updateOne(
          { id },
          { $set: { order: parseInt(String(order)), updatedAt: new Date().toISOString() } }
        )
      )

      await Promise.all(updates)
      return true
    },

    createTransaction: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()

        // Validate required fields
        if (!args.input.bookingId || args.input.amount === undefined) {
          throw new Error('Booking ID and amount are required')
        }

        // Generate unique ID
        const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        const transaction = {
          id: transactionId,
          bookingId: args.input.bookingId,
          userId: args.input.userId || null,
          amount: Math.round(parseFloat(args.input.amount) * 100), // Store in cents
          currency: args.input.currency || 'USD',
          status: args.input.status || 'pending',
          paymentMethod: args.input.paymentMethod || 'card',
          paymentIntentId: args.input.paymentIntentId || null,
          metadata: args.input.metadata ? JSON.parse(args.input.metadata) : null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        const result = await db.collection('transactions').insertOne(transaction)
        return {
          ...transaction,
          amount: transaction.amount / 100, // Return as dollars
          metadata: transaction.metadata ? JSON.stringify(transaction.metadata) : null,
          _id: result.insertedId
        }
      } catch (error: any) {
        console.error('Error in createTransaction resolver:', error)
        throw new Error(`Failed to create transaction: ${error.message}`)
      }
    },

    createInventory: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()

        // Generate unique ID
        const inventoryId = `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        const inventory = {
          id: inventoryId,
          name: args.input.name,
          type: args.input.type,
          size: args.input.size || null,
          cost: parseFloat(args.input.cost),
          quantity: parseInt(args.input.quantity) || 0,
          unit: args.input.unit || 'each',
          supplier: args.input.supplier || null,
          thumbnail: args.input.thumbnail || null,
          amazonAsin: args.input.amazonAsin || null,
          amazonUrl: args.input.amazonUrl || null,
          notes: args.input.notes || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        const result = await db.collection('inventory').insertOne(inventory)
        return { ...inventory, _id: result.insertedId }
      } catch (error: any) {
        console.error('Error in createInventory resolver:', error)
        throw new Error(`Failed to create inventory item: ${error.message}`)
      }
    },

    updateInventory: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()
        const { id, ...updateData } = args.input

        // Build update object with only provided fields
        const update: any = {
          updatedAt: new Date().toISOString()
        }

        if (updateData.name !== undefined) update.name = updateData.name
        if (updateData.type !== undefined) update.type = updateData.type
        if (updateData.size !== undefined) update.size = updateData.size
        if (updateData.cost !== undefined) update.cost = parseFloat(updateData.cost)
        if (updateData.quantity !== undefined) update.quantity = parseInt(updateData.quantity)
        if (updateData.unit !== undefined) update.unit = updateData.unit
        if (updateData.supplier !== undefined) update.supplier = updateData.supplier
        if (updateData.thumbnail !== undefined) update.thumbnail = updateData.thumbnail
        if (updateData.amazonAsin !== undefined) update.amazonAsin = updateData.amazonAsin
        if (updateData.amazonUrl !== undefined) update.amazonUrl = updateData.amazonUrl
        if (updateData.notes !== undefined) update.notes = updateData.notes

        // Try to update by id field first
        let result = await db.collection('inventory').updateOne(
          { id },
          { $set: update }
        )

        // If not found, try MongoDB _id
        if (result.matchedCount === 0 && ObjectId.isValid(id)) {
          result = await db.collection('inventory').updateOne(
            { _id: new ObjectId(id) },
            { $set: update }
          )
        }

        if (result.matchedCount === 0) {
          throw new Error('Inventory item not found')
        }

        // Fetch updated item
        let item = await db.collection('inventory').findOne({ id })
        if (!item && ObjectId.isValid(id)) {
          item = await db.collection('inventory').findOne({ _id: new ObjectId(id) })
        }

        return item
      } catch (error: any) {
        console.error('Error in updateInventory resolver:', error)
        throw new Error(`Failed to update inventory item: ${error.message}`)
      }
    },

    deleteInventory: async (_: any, args: { id: string }) => {
      try {
        const db = await getDatabase()

        // Try to delete by id field first
        let result = await db.collection('inventory').deleteOne({ id: args.id })

        // If not found, try MongoDB _id
        if (result.deletedCount === 0 && ObjectId.isValid(args.id)) {
          result = await db.collection('inventory').deleteOne({ _id: new ObjectId(args.id) })
        }

        if (result.deletedCount === 0) {
          throw new Error('Inventory item not found')
        }

        return true
      } catch (error: any) {
        console.error('Error in deleteInventory resolver:', error)
        throw new Error(`Failed to delete inventory item: ${error.message}`)
      }
    },

    createUser: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()

        // Validate that at least email or walletAddress is provided
        if (!args.input.email && !args.input.walletAddress) {
          throw new Error('Either email or walletAddress is required')
        }

        // Check if user already exists
        const existingQuery: any = {}
        if (args.input.email) {
          existingQuery.email = args.input.email
        }
        if (args.input.walletAddress) {
          existingQuery.walletAddress = args.input.walletAddress
        }

        const existing = await db.collection('users').findOne({
          $or: [
            ...(args.input.email ? [{ email: args.input.email }] : []),
            ...(args.input.walletAddress ? [{ walletAddress: args.input.walletAddress }] : [])
          ]
        })

        if (existing) {
          throw new Error('User with this email or wallet address already exists')
        }

        // Generate unique ID
        const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        const user = {
          id: userId,
          email: args.input.email || null,
          walletAddress: args.input.walletAddress || null,
          name: args.input.name || null,
          role: args.input.role || 'customer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        const result = await db.collection('users').insertOne(user)
        return { ...user, _id: result.insertedId }
      } catch (error: any) {
        console.error('Error in createUser resolver:', error)
        throw new Error(`Failed to create user: ${error.message}`)
      }
    },

    updateUser: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()
        const { id, ...updateData } = args.input

        // Build update object with only provided fields
        const update: any = {
          updatedAt: new Date().toISOString()
        }

        if (updateData.email !== undefined) update.email = updateData.email
        if (updateData.walletAddress !== undefined) update.walletAddress = updateData.walletAddress
        if (updateData.name !== undefined) update.name = updateData.name
        if (updateData.role !== undefined) update.role = updateData.role

        // Try to update by id field first
        let result = await db.collection('users').updateOne(
          { id },
          { $set: update }
        )

        // If not found, try MongoDB _id
        if (result.matchedCount === 0 && ObjectId.isValid(id)) {
          result = await db.collection('users').updateOne(
            { _id: new ObjectId(id) },
            { $set: update }
          )
        }

        if (result.matchedCount === 0) {
          throw new Error('User not found')
        }

        // Fetch updated user
        let user = await db.collection('users').findOne({ id })
        if (!user && ObjectId.isValid(id)) {
          user = await db.collection('users').findOne({ _id: new ObjectId(id) })
        }

        return user
      } catch (error: any) {
        console.error('Error in updateUser resolver:', error)
        throw new Error(`Failed to update user: ${error.message}`)
      }
    },

    createWorker: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()

        // Validate walletAddress is provided
        if (!args.input.walletAddress) {
          throw new Error('Wallet address is required')
        }

        // Check if worker already exists
        const existing = await db.collection('workers').findOne({
          walletAddress: args.input.walletAddress
        })

        if (existing) {
          throw new Error('Worker with this wallet address already exists')
        }

        // Determine worker type based on wallet address
        const OWNER_ADDRESS = '0x2127AA7265D573Aa467f1D73554D17890b872E76'
        const workerType = args.input.walletAddress.toLowerCase() === OWNER_ADDRESS.toLowerCase()
          ? 'Owner'
          : 'Employee'

        // Generate unique ID
        const workerId = `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        const worker = {
          id: workerId,
          walletAddress: args.input.walletAddress,
          workerType,
          name: args.input.name || null,
          email: args.input.email || null,
          phone: args.input.phone || null,
          packagesCheckedIn: [],
          packagesWrapped: [],
          packagesCompleted: [],
          packagesDroppedOff: [],
          availabilityId: args.input.availabilityId || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        const result = await db.collection('workers').insertOne(worker)
        return { ...worker, _id: result.insertedId }
      } catch (error: any) {
        console.error('Error in createWorker resolver:', error)
        throw new Error(`Failed to create worker: ${error.message}`)
      }
    },

    updateWorker: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()
        const { id, ...updateData } = args.input

        // Build update object with only provided fields
        const update: any = {
          updatedAt: new Date().toISOString()
        }

        if (updateData.name !== undefined) update.name = updateData.name
        if (updateData.email !== undefined) update.email = updateData.email
        if (updateData.phone !== undefined) update.phone = updateData.phone
        if (updateData.packagesCheckedIn !== undefined) update.packagesCheckedIn = updateData.packagesCheckedIn
        if (updateData.packagesWrapped !== undefined) update.packagesWrapped = updateData.packagesWrapped
        if (updateData.packagesCompleted !== undefined) update.packagesCompleted = updateData.packagesCompleted
        if (updateData.packagesDroppedOff !== undefined) update.packagesDroppedOff = updateData.packagesDroppedOff
        if (updateData.availabilityId !== undefined) update.availabilityId = updateData.availabilityId

        // Try to update by id field first
        let result = await db.collection('workers').updateOne(
          { id },
          { $set: update }
        )

        // If not found, try MongoDB _id
        if (result.matchedCount === 0 && ObjectId.isValid(id)) {
          result = await db.collection('workers').updateOne(
            { _id: new ObjectId(id) },
            { $set: update }
          )
        }

        if (result.matchedCount === 0) {
          throw new Error('Worker not found')
        }

        // Fetch updated worker
        let worker = await db.collection('workers').findOne({ id })
        if (!worker && ObjectId.isValid(id)) {
          worker = await db.collection('workers').findOne({ _id: new ObjectId(id) })
        }

        return worker
      } catch (error: any) {
        console.error('Error in updateWorker resolver:', error)
        throw new Error(`Failed to update worker: ${error.message}`)
      }
    },

    addWorkerPackage: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()
        const { id, bookingId, action } = args.input

        // Determine which array to update based on action
        const fieldMap: Record<string, string> = {
          check_in: 'packagesCheckedIn',
          wrap: 'packagesWrapped',
          complete: 'packagesCompleted',
          drop_off: 'packagesDroppedOff'
        }

        const field = fieldMap[action]
        if (!field) {
          throw new Error(`Invalid action: ${action}. Must be one of: check_in, wrap, complete, drop_off`)
        }

        // Find worker
        let worker = await db.collection('workers').findOne({ id })
        if (!worker && ObjectId.isValid(id)) {
          worker = await db.collection('workers').findOne({ _id: new ObjectId(id) })
        }

        if (!worker) {
          throw new Error('Worker not found')
        }

        // Add bookingId to the appropriate array if not already present
        const currentArray = worker[field] || []
        if (!currentArray.includes(bookingId)) {
          currentArray.push(bookingId)
        }

        // Update worker
        const update: any = {
          [field]: currentArray,
          updatedAt: new Date().toISOString()
        }

        let result = await db.collection('workers').updateOne(
          { id },
          { $set: update }
        )

        if (result.matchedCount === 0 && ObjectId.isValid(id)) {
          result = await db.collection('workers').updateOne(
            { _id: new ObjectId(id) },
            { $set: update }
          )
        }

        // Fetch updated worker
        worker = await db.collection('workers').findOne({ id })
        if (!worker && ObjectId.isValid(id)) {
          worker = await db.collection('workers').findOne({ _id: new ObjectId(id) })
        }

        return worker
      } catch (error: any) {
        console.error('Error in addWorkerPackage resolver:', error)
        throw new Error(`Failed to add package to worker: ${error.message}`)
      }
    }
  }
}

