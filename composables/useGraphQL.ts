// GraphQL client composable for making GraphQL queries and mutations
export const useGraphQL = () => {
  const executeQuery = async (query: string, variables?: Record<string, any>) => {
    try {
      // Extract operation name from query for logging
      const operationMatch = query.match(/query\s+(\w+)/)
      const operationName = operationMatch ? operationMatch[1] : 'anonymous'
      
      console.log(`🔵 useGraphQL: Sending request to /api/graphql (operation: ${operationName})`)
      console.log('🔵 Query preview:', query.substring(0, 200) + '...')
      
      const requestBody = {
        query,
        variables: variables || {}
      }
      console.log('🔵 Request body:', JSON.stringify(requestBody).substring(0, 300) + '...')
      
      // Add a unique request ID to help track responses
      const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      console.log(`🔵 Request ID: ${requestId}`)
      
      const response = await $fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Request-ID': requestId // Add request ID header
        },
        body: requestBody
      })
      
      console.log(`🟢 Response for request ${requestId}:`, response)

      console.log('🟢 useGraphQL: Received response:', response)
      console.log('🟢 Response type:', typeof response)
      console.log('🟢 Response keys:', Object.keys(response))
      console.log('🟢 Response.data type:', typeof response.data)
      console.log('🟢 Response.data keys:', response.data ? Object.keys(response.data) : 'no data')
      
      // Log the actual data structure
      if (response.data) {
        console.log('🟢 Response.data content:', JSON.stringify(response.data, null, 2).substring(0, 500))
        if (response.data.inventory) {
          console.log('🟢 Found inventory in response:', response.data.inventory.length, 'items')
        }
        if (response.data.pricing) {
          console.log('🟢 Found pricing in response:', response.data.pricing.length, 'items')
          console.warn('⚠️ WARNING: Pricing data found when expecting inventory!')
        }
      }

      if (response.errors) {
        console.error('🔴 useGraphQL: Response has errors:', response.errors)
        const errorMessage = response.errors[0]?.message || 'GraphQL error'
        const errorObj = new Error(errorMessage) as any
        errorObj.data = response
        errorObj.errors = response.errors
        throw errorObj
      }

      console.log('✅ useGraphQL: Returning data:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ useGraphQL: Query error:', error)
      console.error('Error message:', error?.message)
      console.error('Error status:', error?.status)
      console.error('Error statusCode:', error?.statusCode)
      if (error.data) {
        console.error('GraphQL response:', error.data)
      }
      if (error.response) {
        console.error('HTTP response:', error.response)
      }
      throw error
    }
  }

  return {
    executeQuery
  }
}

