import { defineEventHandler, createError } from 'h3'
import { getDatabase } from '../../utils/mongodb'

/**
 * Migrate legacy booking statuses to new status workflow
 * POST /api/admin/migrate-booking-status
 * 
 * Converts:
 * - "confirmed" -> "pending" (since we only take confirmed payments, initial status is pending)
 */
export default defineEventHandler(async (event) => {
  try {
    const db = await getDatabase()
    if (!db) {
      throw createError({
        statusCode: 500,
        message: 'Database connection failed'
      })
    }
    
    // Find all bookings with "confirmed" status
    const confirmedBookings = await db.collection('bookings').find({
      status: 'confirmed'
    }).toArray()

    console.log(`Found ${confirmedBookings.length} bookings with "confirmed" status`)

    if (confirmedBookings.length === 0) {
      return {
        success: true,
        message: 'No bookings to migrate',
        migrated: 0
      }
    }

    // Update all "confirmed" bookings to "pending"
    const result = await db.collection('bookings').updateMany(
      { status: 'confirmed' },
      {
        $set: {
          status: 'pending',
          updatedAt: new Date().toISOString()
        }
      }
    )

    console.log(`Migrated ${result.modifiedCount} bookings from "confirmed" to "pending"`)

    return {
      success: true,
      message: `Successfully migrated ${result.modifiedCount} bookings`,
      migrated: result.modifiedCount
    }
  } catch (error: any) {
    console.error('Error migrating booking statuses:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to migrate booking statuses'
    })
  }
})


