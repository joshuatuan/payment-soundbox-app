import { NextRequest, NextResponse } from 'next/server'
import { VertexAI } from '@google-cloud/vertexai'
import { VoiceContext } from '@/types/voice'

// Initialize Vertex AI client with Service Account credentials
const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT_ID!,
  location: process.env.GOOGLE_CLOUD_REGION || 'asia-southeast1',
  googleAuthOptions: {
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },
})

// Initialize Gemini model (using stable version available in asia-southeast1)
const model = vertexAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

export async function POST(request: NextRequest) {
  try {
    const { text, context } = await request.json() as { text: string; context: VoiceContext }

    if (!text || !context) {
      return NextResponse.json({ error: 'Missing text or context' }, { status: 400 })
    }

    // Build context-aware prompt
    const systemPrompt = `You are a helpful financial assistant for GKash payment app.
User: ${context.userType}
Balance: ₱${context.balance}
Transactions: ${context.transactionCount}
${context.totalRevenue ? `Revenue: ₱${context.totalRevenue}` : ''}

Recent transactions:
${context.recentTransactions.map(t => `- ₱${t.amount} ${context.userType === 'merchant' ? 'from' : 'to'} ${t.otherParty}`).join('\n')}

Answer concisely in 1-2 sentences. Use Philippine peso (₱) for currency.`

    // Call Gemini API using SDK
    const result = await model.generateContent({
      contents: [{ 
        role: 'user', 
        parts: [{ text: `${systemPrompt}\n\nQuestion: ${text}` }] 
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 150,
      },
    })

    // Extract AI response
    const aiResponse = result.response.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not process your request.'

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error('Error in chat:', error)
    return NextResponse.json({ error: 'AI response failed' }, { status: 500 })
  }
}


