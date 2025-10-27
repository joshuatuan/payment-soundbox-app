export interface VoiceContext {
  userId: number
  userType: 'merchant' | 'payer'
  balance: number
  transactionCount: number
  totalRevenue?: number
  recentTransactions: Array<{
    id: number
    amount: number
    timestamp: string
    otherParty: string
  }>
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error'

export interface TranscriptionResponse {
  text: string
}

export interface ChatResponse {
  response: string
}

export interface SpeechResponse {
  audio: string
}


