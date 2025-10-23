import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userType = searchParams.get('userType')
    
    let whereClause = {}
    
    if (userId && userType) {
      if (userType === 'payer') {
        whereClause = { payerId: parseInt(userId) }
      } else if (userType === 'merchant') {
        whereClause = { merchantId: parseInt(userId) }
      }
    }
    
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        payer: true,
        merchant: true
      },
      orderBy: {
        timestamp: 'desc'
      }
    })
    
    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payerId, merchantId, amount } = await request.json()
    
    if (!payerId || !merchantId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid transaction data' }, { status: 400 })
    }
    
    // Check if payer has sufficient balance
    const payer = await prisma.user.findUnique({
      where: { id: payerId }
    })
    
    if (!payer) {
      return NextResponse.json({ error: 'Payer not found' }, { status: 404 })
    }
    
    if (payer.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }
    
    // Create transaction and update balances in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from payer
      await tx.user.update({
        where: { id: payerId },
        data: {
          balance: {
            decrement: amount
          }
        }
      })
      
      // Add to merchant
      await tx.user.update({
        where: { id: merchantId },
        data: {
          balance: {
            increment: amount
          }
        }
      })
      
      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          payerId,
          merchantId,
          amount
        },
        include: {
          payer: true,
          merchant: true
        }
      })
      
      return transaction
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error processing transaction:', error)
    return NextResponse.json({ error: 'Failed to process transaction' }, { status: 500 })
  }
}
