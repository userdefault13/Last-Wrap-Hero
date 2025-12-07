import { ref, computed } from 'vue'
import { useGraphQL } from '~/composables/useGraphQL'

export interface Booking {
  id: string
  name: string
  email: string
  phone: string
  service: string
  date: string
  time: string
  address: string
  numberOfGifts: number
  message: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
}

const bookings = ref<Booking[]>([])

export const useBookings = () => {
  // Load bookings from GraphQL (database only, no localStorage fallback)
  const loadBookings = async () => {
    if (process.client) {
      try {
        // Clear bookings first to ensure fresh data
        bookings.value = []
        
        const { executeQuery } = useGraphQL()
        const query = `
          query {
            bookings {
              id
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
            }
          }
        `
        const data = await executeQuery(query)
        console.log('GraphQL bookings response:', data)
        bookings.value = data.bookings || []
        console.log('Loaded bookings count:', bookings.value.length)
      } catch (error) {
        console.error('Error loading bookings:', error)
        bookings.value = [] // Clear instead of using localStorage
      }
    }
  }

  // Don't auto-load - let components call loadBookings() explicitly

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'status' | 'createdAt'>) => {
    try {
      // Use GraphQL mutation to create booking
      const { executeQuery } = useGraphQL()
      const mutation = `
        mutation CreateBooking($input: CreateBookingInput!) {
          createBooking(input: $input) {
            id
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
          }
        }
      `
      
      const data = await executeQuery(mutation, {
        input: {
          name: bookingData.name,
          email: bookingData.email,
          phone: bookingData.phone,
          service: bookingData.service,
          date: bookingData.date,
          time: bookingData.time,
          address: bookingData.address,
          numberOfGifts: bookingData.numberOfGifts,
          message: bookingData.message || ''
        }
      })
      
      if (data.createBooking) {
        const newBooking = data.createBooking
        bookings.value.push(newBooking)
        return newBooking
      }
      
      throw new Error('Failed to create booking')
    } catch (error) {
      console.error('Error creating booking:', error)
      throw error // Re-throw instead of falling back to localStorage
    }
  }

  const getBooking = (id: string) => {
    return bookings.value.find(b => b.id === id)
  }

  const updateBookingStatus = async (id: string, status: Booking['status']) => {
    try {
      // Use GraphQL mutation instead of REST API
      const { executeQuery } = useGraphQL()
      const mutation = `
        mutation UpdateBookingStatus($input: UpdateBookingStatusInput!) {
          updateBookingStatus(input: $input) {
            id
            status
            updatedAt
          }
        }
      `
      
      const data = await executeQuery(mutation, {
        input: {
          id,
          status
        }
      })
      
      if (data.updateBookingStatus) {
        const index = bookings.value.findIndex(b => b.id === id)
        if (index !== -1) {
          bookings.value[index] = { ...bookings.value[index], ...data.updateBookingStatus }
        }
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      throw error
    }
  }

  const getAvailableTimeSlots = async (date: string): Promise<string[]> => {
    // Query GraphQL API for available time slots (primary method)
    try {
      const { executeQuery } = useGraphQL()
      const query = `
        query {
          availableTimeSlots(date: "${date}")
        }
      `
      const data = await executeQuery(query)
      return data.availableTimeSlots || []
    } catch (error) {
      console.error('Error fetching available time slots via API:', error)
      // Fallback to localStorage if API fails
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('wrapsody-availability')
        if (stored) {
          try {
            const data = JSON.parse(stored)
            if (!Array.isArray(data)) {
              const dayOfWeekSchedules = data.dayOfWeekSchedules || []
              const dateObj = new Date(date)
              const dayOfWeek = dateObj.getDay()
              const daySchedule = dayOfWeekSchedules.find((s: any) => s.dayOfWeek === dayOfWeek)
              
              if (daySchedule && !daySchedule.isBlocked && daySchedule.slots.length > 0) {
                // Get bookings for this date to filter out booked slots
                const dayBookings = bookings.value.filter(
                  b => b.date === date && b.status !== 'cancelled'
                )
                const bookedTimes = dayBookings.map(b => b.time)
                
                // Return scheduled slots that aren't booked
                return daySchedule.slots.filter((slot: string) => !bookedTimes.includes(slot))
              }
            }
          } catch (e) {
            console.error('Error loading day-of-week schedule:', e)
          }
        }
      }
      
      // Final fallback: default time slots (6 AM to 11 PM)
      const dayBookings = bookings.value.filter(
        b => b.date === date && b.status !== 'cancelled'
      )
      const bookedTimes = dayBookings.map(b => b.time)
      const slots = []
      for (let hour = 6; hour <= 23; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`
        if (!bookedTimes.includes(time)) {
          slots.push(time)
        }
      }
      return slots
    }
  }

  const isDateAvailable = async (date: string): Promise<boolean> => {
    // Don't allow past dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(date)
    selectedDate.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) return false

    // Check via GraphQL API (primary method)
    try {
      const { executeQuery } = useGraphQL()
      const query = `
        query {
          isDateAvailable(date: "${date}")
        }
      `
      const data = await executeQuery(query)
      return data.isDateAvailable || false
    } catch (error) {
      console.error('Error checking date availability via API:', error)
      // Fallback to localStorage check if API fails
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('wrapsody-availability')
        if (stored) {
          try {
            const data = JSON.parse(stored)
            if (!Array.isArray(data)) {
              const dayOfWeekSchedules = data.dayOfWeekSchedules || []
              const dateObj = new Date(date)
              const dayOfWeek = dateObj.getDay()
              const daySchedule = dayOfWeekSchedules.find((s: any) => s.dayOfWeek === dayOfWeek)
              
              if (daySchedule) {
                if (daySchedule.isBlocked) {
                  return false
                }
                // If not blocked, check if there are available slots
                if (daySchedule.slots.length > 0) {
                  const dayBookings = bookings.value.filter(
                    b => b.date === date && b.status !== 'cancelled'
                  )
                  const bookedTimes = dayBookings.map(b => b.time)
                  const availableSlots = daySchedule.slots.filter((slot: string) => !bookedTimes.includes(slot))
                  return availableSlots.length > 0
                }
                return false
              }
            }
          } catch (e) {
            console.error('Error checking day-of-week schedule:', e)
          }
        }
      }
      return false
    }
  }

  const getAllBookings = computed(() => bookings.value)

  return {
    bookings: getAllBookings,
    loadBookings,
    createBooking,
    getBooking,
    updateBookingStatus,
    getAvailableTimeSlots,
    isDateAvailable
  }
}

