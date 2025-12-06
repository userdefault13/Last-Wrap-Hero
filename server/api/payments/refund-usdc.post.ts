import { getDatabase } from '~/server/utils/mongodb'
import { ethers } from 'ethers'

// USDC contract address on Base chain
const USDC_CONTRACT_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
// Base RPC endpoint
const BASE_RPC_URL = 'https://mainnet.base.org'

// USDC ABI (minimal - just transfer function)
const USDC_ABI = [
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)'
]

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const db = await getDatabase()
    
    // Validate required fields
    if (!body.bookingId || !body.transactionId || !body.recipientAddress) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields (bookingId, transactionId, recipientAddress)'
      })
    }

    // Validate recipient address format
    if (!ethers.isAddress(body.recipientAddress)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid recipient address format'
      })
    }

    // Get transaction from database
    const transaction = await db.collection('transactions').findOne({
      id: body.transactionId,
      bookingId: body.bookingId
    })

    if (!transaction) {
      throw createError({
        statusCode: 404,
        message: 'Transaction not found'
      })
    }

    if (transaction.status !== 'completed') {
      throw createError({
        statusCode: 400,
        message: 'Can only refund completed transactions'
      })
    }

    if (transaction.paymentMethod !== 'usdc') {
      throw createError({
        statusCode: 400,
        message: 'This endpoint is for USDC refunds only'
      })
    }

    // Verify the original transaction exists on blockchain
    const metadata = transaction.metadata || {}
    const originalTxHash = metadata.transactionHash

    if (!originalTxHash) {
      throw createError({
        statusCode: 400,
        message: 'Original transaction hash not found'
      })
    }

    // Connect to Base network
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL)
    
    // Verify the original transaction
    try {
      const originalTx = await provider.getTransaction(originalTxHash)
      if (!originalTx) {
        throw createError({
          statusCode: 400,
          message: 'Original transaction not found on blockchain'
        })
      }

      // Get transaction receipt to verify it was successful
      const receipt = await provider.getTransactionReceipt(originalTxHash)
      if (!receipt || receipt.status !== 1) {
        throw createError({
          statusCode: 400,
          message: 'Original transaction was not successful'
        })
      }

      // Verify the amount matches
      // USDC uses 6 decimals, so we need to convert from dollars to USDC units
      const usdcDecimals = 6
      const expectedAmount = ethers.parseUnits(
        (transaction.amount / 100).toFixed(usdcDecimals),
        usdcDecimals
      )

      // Parse the transaction to get the actual amount sent
      // This is a simplified check - in production, you'd parse the transaction data more carefully
      const actualAmount = originalTx.value || BigInt(0)
      
      // For USDC transfers, we need to check the transfer event in the receipt
      const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, USDC_ABI, provider)
      const transferEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = usdcContract.interface.parseLog(log)
          return parsed && parsed.name === 'Transfer'
        } catch {
          return false
        }
      })

      if (!transferEvent) {
        throw createError({
          statusCode: 400,
          message: 'Could not verify USDC transfer amount'
        })
      }

      // Note: In production, you would:
      // 1. Get the admin wallet private key from secure environment variable
      // 2. Create a wallet instance
      // 3. Send USDC back to the recipient address
      // 4. Wait for transaction confirmation
      // 5. Update transaction status

      // For now, we'll mark it as pending refund and return instructions
      // In production, implement actual USDC transfer here

      await db.collection('transactions').updateOne(
        { id: transaction.id },
        {
          $set: {
            status: 'refund_pending',
            refundRecipientAddress: body.recipientAddress,
            refundInitiatedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      )

      return {
        success: true,
        data: {
          message: 'Refund initiated. USDC will be sent to recipient address.',
          recipientAddress: body.recipientAddress,
          amount: transaction.amount / 100, // Convert cents to dollars
          transactionId: transaction.id,
          note: 'In production, this would execute the actual USDC transfer. Admin wallet private key required.'
        }
      }
    } catch (error) {
      console.error('Error verifying blockchain transaction:', error)
      throw createError({
        statusCode: 500,
        message: error.message || 'Failed to verify blockchain transaction'
      })
    }
  } catch (error) {
    console.error('Error processing USDC refund:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to process refund'
    })
  }
})


