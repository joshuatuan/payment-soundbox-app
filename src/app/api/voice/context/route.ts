import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = parseInt(searchParams.get('userId') || '0')
    const userType = searchParams.get('userType') as 'merchant' | 'payer'

    if (!userId || !userType) {
      return NextResponse.json({ error: 'Missing userId or userType' }, { status: 400 })
    }

    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch transactions
    const whereClause = userType === 'merchant' 
      ? { merchantId: userId }
      : { payerId: userId }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        payer: true,
        merchant: true
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10
    })

    // Calculate metrics
    const transactionCount = transactions.length
    const totalRevenue = userType === 'merchant'
      ? transactions.reduce((sum, t) => sum + t.amount, 0)
      : undefined

    // Format recent transactions
    const recentTransactions = transactions.slice(0, 5).map(t => ({
      id: t.id,
      amount: t.amount,
      timestamp: t.timestamp.toISOString(),
      otherParty: userType === 'merchant' ? t.payer.name : t.merchant.name
    }))

    const context = {
      userId: user.id,
      userType,
      balance: user.balance,
      transactionCount,
      totalRevenue,
      recentTransactions
    }

    return NextResponse.json(context)
  } catch (error) {
    console.error('Error fetching voice context:', error)
    return NextResponse.json({ error: 'Failed to fetch context' }, { status: 500 })
  }
}


