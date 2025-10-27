'use client'

import { useState, useRef, useEffect } from 'react'
import { VoiceContext, VoiceState } from '@/types/voice'

interface VoiceAssistantProps {
  userId: number
  userType: 'merchant' | 'payer'
}

export default function VoiceAssistant({ userId, userType }: VoiceAssistantProps) {
  const [state, setState] = useState<VoiceState>('idle')
  const [error, setError] = useState<string>('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [context, setContext] = useState<VoiceContext | null>(null)

  // Fetch context on mount
  useEffect(() => {
    fetchContext()
  }, [userId, userType])

  const fetchContext = async () => {
    try {
      const response = await fetch(`/api/voice/context?userId=${userId}&userType=${userType}`)
      if (response.ok) {
        const data = await response.json()
        setContext(data)
      }
    } catch (error) {
      console.error('Error fetching context:', error)
    }
  }

  const startRecording = async () => {
    try {
      setError('')
      setState('listening')
      audioChunksRef.current = []

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop())
        await processAudio()
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
    } catch (error) {
      console.error('Error starting recording:', error)
      setError('Microphone access denied')
      setState('idle')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  const processAudio = async () => {
    setState('processing')

    try {
      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })

      // Transcribe
      const formData = new FormData()
      formData.append('audio', audioBlob)

      const transcribeResponse = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!transcribeResponse.ok) {
        throw new Error('Transcription failed')
      }

      const { text } = await transcribeResponse.json()

      if (!text) {
        throw new Error('No speech detected')
      }

      // Get AI response
      const chatResponse = await fetch('/api/voice/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, context }),
      })

      if (!chatResponse.ok) {
        throw new Error('AI response failed')
      }

      const { response } = await chatResponse.json()

      // Speak response
      setState('speaking')
      await speakResponse(response)

      setState('idle')
      
      // Refresh context after interaction
      fetchContext()
    } catch (error) {
      console.error('Error processing audio:', error)
      setError('Failed to process voice command')
      setState('error')
      setTimeout(() => {
        setState('idle')
        setError('')
      }, 3000)
    }
  }

  const speakResponse = async (text: string) => {
    try {
      // Try Vertex AI TTS first
      const response = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (response.ok) {
        const { audio } = await response.json()
        const audioBlob = new Blob(
          [Uint8Array.from(atob(audio), c => c.charCodeAt(0))],
          { type: 'audio/mp3' }
        )
        const audioUrl = URL.createObjectURL(audioBlob)
        const audioElement = new Audio(audioUrl)
        
        await new Promise((resolve, reject) => {
          audioElement.onended = resolve
          audioElement.onerror = reject
          audioElement.play()
        })

        URL.revokeObjectURL(audioUrl)
      } else {
        throw new Error('TTS failed')
      }
    } catch (error) {
      // Fallback to browser TTS
      console.log('Using browser TTS fallback')
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'en-US'
        utterance.rate = 0.9
        
        await new Promise((resolve) => {
          utterance.onend = resolve
          speechSynthesis.speak(utterance)
        })
      }
    }
  }

  const handleClick = () => {
    if (state === 'idle') {
      startRecording()
    } else if (state === 'listening') {
      stopRecording()
    }
  }

  const getButtonStyle = () => {
    switch (state) {
      case 'listening':
        return 'bg-red-500 hover:bg-red-600 animate-pulse'
      case 'processing':
        return 'bg-yellow-500 cursor-wait'
      case 'speaking':
        return 'bg-green-500 cursor-wait'
      case 'error':
        return 'bg-gray-500 cursor-not-allowed'
      default:
        return 'bg-blue-600 hover:bg-blue-700'
    }
  }

  const getButtonText = () => {
    switch (state) {
      case 'listening':
        return '🎤 Listening...'
      case 'processing':
        return '⏳ Processing...'
      case 'speaking':
        return '🔊 Speaking...'
      case 'error':
        return '❌ Error'
      default:
        return '🎤 Ask AI'
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={state === 'processing' || state === 'speaking' || state === 'error'}
        className={`fixed bottom-8 right-8 z-50 ${getButtonStyle()} text-white font-semibold px-6 py-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-75`}
        title="Voice Assistant"
      >
        {getButtonText()}
      </button>

      {error && (
        <div className="fixed bottom-24 right-8 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-xs">
          {error}
        </div>
      )}
    </>
  )
}


