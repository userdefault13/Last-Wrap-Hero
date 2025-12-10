import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    
    // Debug logging (remove sensitive data in production)
    console.log('Stripe config check:', {
      hasStripeSecretKey: !!config.stripeSecretKey,
      keyPrefix: config.stripeSecretKey ? config.stripeSecretKey.substring(0, 7) : 'missing',
      allConfigKeys: Object.keys(config)
    })
    
    if (!config.stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY is missing from runtime config')
      throw createError({
        statusCode: 500,
        message: 'Stripe secret key not configured. Please add STRIPE_SECRET_KEY to your .env file.'
      })
    }

    // Clean the Stripe key - aggressively remove any invalid characters
    // Remove all whitespace, newlines, carriage returns, and any non-printable characters
    const rawKey = String(config.stripeSecretKey || '')
    let cleanedStripeKey = rawKey
      .trim()
      .replace(/[\r\n\t]/g, '') // Remove newlines, carriage returns, tabs
      .replace(/\s+/g, '') // Remove all whitespace
      .replace(/[^\x20-\x7E]/g, '') // Remove any non-printable ASCII characters
      .replace(/[^\w\-_]/g, '') // Only allow word characters, hyphens, underscores (Stripe keys use these)
    
    // Additional validation: Stripe keys should only contain alphanumeric and underscore
    // Format: sk_test_ or sk_live_ followed by alphanumeric and underscore
    if (!cleanedStripeKey.match(/^sk_(test|live)_[a-zA-Z0-9_]+$/)) {
      console.error('Invalid Stripe secret key format after cleaning', {
        originalLength: rawKey.length,
        cleanedLength: cleanedStripeKey.length,
        cleanedPrefix: cleanedStripeKey.substring(0, 20),
        hasInvalidChars: /[^\w\-_]/.test(rawKey)
      })
      throw createError({
        statusCode: 500,
        message: 'Invalid Stripe secret key format. Please check your STRIPE_SECRET_KEY environment variable.'
      })
    }
    
    console.log('Stripe key validated:', {
      originalLength: rawKey.length,
      cleanedLength: cleanedStripeKey.length,
      keyPrefix: cleanedStripeKey.substring(0, 12) + '...'
    })

    const stripe = new Stripe(cleanedStripeKey, {
      // Use default API version for better compatibility
      maxNetworkRetries: 2,
    })

    const body = await readBody(event)
    
    if (!body.amount || !body.currency) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields: amount and currency are required'
      })
    }
    
    // bookingId is optional - booking may be created after payment
    const bookingId = body.bookingId || 'pending'

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: body.amount, // Amount in cents
      currency: body.currency.toLowerCase(),
      metadata: {
        bookingId: bookingId
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return {
      clientSecret: paymentIntent.client_secret
    }
  } catch (error: any) {
    console.error('Error creating payment intent:', error)
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
      raw: error.raw
    })
    
    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        message: error.message || 'Stripe API error'
      })
    }
    
    // Return more detailed error message
    const errorMessage = error.message || 'Failed to create payment intent'
    throw createError({
      statusCode: 500,
      message: `Stripe error: ${errorMessage}`
    })
  }
})

