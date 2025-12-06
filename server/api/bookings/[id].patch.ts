import { getDatabase } from '~/server/utils/mongodb'
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const db = await getDatabase()
    
    // Get current booking to check refund eligibility
    let booking = await db.collection('bookings').findOne({ id })
    if (!booking && ObjectId.isValid(id)) {
      booking = await db.collection('bookings').findOne({ _id: new ObjectId(id) })
    }
    
    if (!booking) {
      throw createError({
        statusCode: 404,
        message: 'Booking not found'
      })
    }

    // Check if cancellation is eligible for refund (before appointment date)
    let refundEligible = false
    if (body.status === 'cancelled') {
      const appointmentDate = new Date(`${booking.date}T${booking.time}`)
      const now = new Date()
      
      // Refund eligible if cancelled before appointment date
      if (now < appointmentDate) {
        refundEligible = true
        
        // Check if there's a completed transaction for this booking
        const transaction = await db.collection('transactions').findOne({
          bookingId: booking.id,
          status: 'completed'
        })
        
        if (transaction) {
          // Mark transaction as eligible for refund
          await db.collection('transactions').updateOne(
            { id: transaction.id },
            {
              $set: {
                refundEligible: true,
                refundEligibleAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            }
          )
        }
      }
    }
    
    const updateData = {
      ...body,
      refundEligible: refundEligible,
      updatedAt: new Date().toISOString()
    }
    
    // Try to update by id field first
    let result = await db.collection('bookings').updateOne(
      { id },
      { $set: updateData }
    )
    
    // If not found, try MongoDB _id
    if (result.matchedCount === 0 && ObjectId.isValid(id)) {
      result = await db.collection('bookings').updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      )
    }
    
    if (result.matchedCount === 0) {
      throw createError({
        statusCode: 404,
        message: 'Booking not found'
      })
    }
    
    const updatedBooking = await db.collection('bookings').findOne(
      result.matchedCount > 0 ? { id } : { _id: new ObjectId(id) }
    )
    
    return {
      success: true,
      data: updatedBooking,
      refundEligible: refundEligible
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error updating booking:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update booking'
    })
  }
})

