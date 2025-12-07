import { getDatabase } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const db = await getDatabase()
    
    // If workerId is provided, update worker-specific availability
    if (body.workerId) {
      const worker = await db.collection('workers').findOne({ id: body.workerId })
      if (!worker) {
        throw createError({
          statusCode: 404,
          message: 'Worker not found'
        })
      }
      
      let availabilityId = worker.availabilityId
      
      // If worker doesn't have availability, create one
      if (!availabilityId) {
        availabilityId = `availability-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        // Update worker with new availabilityId
        await db.collection('workers').updateOne(
          { id: body.workerId },
          { $set: { availabilityId: availabilityId, updatedAt: new Date().toISOString() } }
        )
      }
      
      const schedule = {
        id: availabilityId,
        type: 'worker_schedule',
        workerId: body.workerId,
        availability: body.availability || [],
        dayOfWeekSchedules: body.dayOfWeekSchedules || [],
        updatedAt: new Date().toISOString()
      }
      
      // Upsert the worker schedule
      await db.collection('availability').updateOne(
        { id: availabilityId },
        { $set: schedule },
        { upsert: true }
      )
      
      return {
        success: true,
        data: schedule
      }
    }
    
    // Otherwise, update global schedule (for backward compatibility)
    const schedule = {
      type: 'schedule',
      availability: body.availability || [],
      dayOfWeekSchedules: body.dayOfWeekSchedules || [],
      updatedAt: new Date().toISOString()
    }
    
    // Upsert the schedule
    await db.collection('availability').updateOne(
      { type: 'schedule' },
      { $set: schedule },
      { upsert: true }
    )
    
    return {
      success: true,
      data: schedule
    }
  } catch (error: any) {
    console.error('Error saving availability:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to save availability'
    })
  }
})

