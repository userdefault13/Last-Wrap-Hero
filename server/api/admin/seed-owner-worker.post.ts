import { defineEventHandler, createError } from 'h3'
import { getDatabase } from '~/server/utils/mongodb'

/**
 * Seed the owner worker in the database
 * POST /api/admin/seed-owner-worker
 * 
 * Creates the owner worker with wallet address 0x2127AA7265D573Aa467f1D73554D17890b872E76
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

    const OWNER_ADDRESS = '0x2127AA7265D573Aa467f1D73554D17890b872E76'

    // Check if worker already exists
    const existing = await db.collection('workers').findOne({
      walletAddress: OWNER_ADDRESS
    })

    if (existing) {
      return {
        success: true,
        message: 'Owner worker already exists',
        worker: existing
      }
    }

    // Generate unique ID
    const workerId = `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const worker = {
      id: workerId,
      walletAddress: OWNER_ADDRESS,
      workerType: 'Owner',
      name: 'Owner',
      email: null,
      phone: null,
      packagesCheckedIn: [],
      packagesWrapped: [],
      packagesCompleted: [],
      packagesDroppedOff: [],
      availabilityId: null, // Can be set later to link to availability
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await db.collection('workers').insertOne(worker)

    return {
      success: true,
      message: 'Owner worker created successfully',
      worker: { ...worker, _id: result.insertedId }
    }
  } catch (error: any) {
    console.error('Error seeding owner worker:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to seed owner worker'
    })
  }
})

