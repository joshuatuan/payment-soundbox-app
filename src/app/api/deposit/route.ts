import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId, amount } = await request.json()
    
    if (!userId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid userId or amount' }, { status: 400 })
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          increment: amount
        }
      }
    })
    
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error processing deposit:', error)
    return NextResponse.json({ error: 'Failed to process deposit' }, { status: 500 })
  }
}
