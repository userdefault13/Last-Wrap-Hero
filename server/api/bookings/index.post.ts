import { getDatabase } from '~/server/utils/mongodb'
import { sendPendingBookingEmail } from '~/server/utils/email'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const db = await getDatabase()
    
    const booking = {
      ...body,
      id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: body.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await db.collection('bookings').insertOne(booking)
    const createdBooking = { ...booking, _id: result.insertedId }

    // Send pending booking confirmation email (fire-and-forget)
    if (booking.email && booking.status === 'pending') {
      console.log(`📧 Scheduling email for booking ${booking.id}`)
      console.log(`   Customer email: ${booking.email}`)
      console.log(`   Customer name: ${booking.name}`)
      console.log(`   Sender email: ${process.env.GMAIL_USER}`)
      
      // Verify the email is different from sender
      if (booking.email === process.env.GMAIL_USER) {
        console.warn(`⚠️  WARNING: Customer email matches sender email! This might be a test booking.`)
      }
      
      sendPendingBookingEmail({
        name: booking.name,
        email: booking.email,
        date: booking.date,
        time: booking.time,
        numberOfGifts: booking.numberOfGifts || 1,
        id: booking.id,
        service: booking.service || 'standard',
      }).then((result) => {
        console.log(`✅ Email sent successfully for booking ${booking.id}:`, result)
        console.log(`   Sent to: ${booking.email}`)
      }).catch((error) => {
        console.error(`❌ Failed to send pending booking email for booking ${booking.id}:`, error)
        console.error('   Error details:', error.message || error)
        // Don't throw - email failure shouldn't fail the booking creation
      })
    } else {
      console.log(`⚠️  Skipping email - booking email: ${booking.email}, status: ${booking.status}`)
    }
    
    return {
      success: true,
      data: createdBooking
    }
  } catch (error) {
    console.error('Error creating booking:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to create booking'
    })
  }
})

