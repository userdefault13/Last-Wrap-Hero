import { getDatabase } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    const db = await getDatabase()
    const query = getQuery(event)
    const workerId = query.workerId as string | undefined
    
    let availability
    
    // If workerId is provided, get worker-specific availability
    if (workerId) {
      const worker = await db.collection('workers').findOne({ id: workerId })
      if (!worker) {
        throw createError({
          statusCode: 404,
          message: 'Worker not found'
        })
      }
      
      if (worker.availabilityId) {
        availability = await db.collection('availability').findOne({ id: worker.availabilityId })
      }
      
      // If worker has no availability, return default
      if (!availability) {
        return {
          success: true,
          data: { availability: [], dayOfWeekSchedules: [] }
        }
      }
    } else {
      // Otherwise, return global schedule (for backward compatibility)
      availability = await db.collection('availability').findOne({ type: 'schedule' })
    }
    
    return {
      success: true,
      data: availability || { availability: [], dayOfWeekSchedules: [] }
    }
  } catch (error: any) {
    console.error('Error fetching availability:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch availability'
    })
  }
})

