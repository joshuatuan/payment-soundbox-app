import { NextRequest, NextResponse } from 'next/server'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'

// Initialize Text-to-Speech client with Service Account credentials
const ttsClient = new TextToSpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
})

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    // Call Text-to-Speech API using SDK
    const [response] = await ttsClient.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Neural2-F',
      },
      audioConfig: {
        audioEncoding: 'MP3',
      },
    })

    // Convert audio content to base64
    const audioContent = response.audioContent?.toString('base64')

    if (!audioContent) {
      return NextResponse.json({ error: 'No audio generated' }, { status: 500 })
    }

    return NextResponse.json({ audio: audioContent })
  } catch (error) {
    console.error('Error in speech synthesis:', error)
    return NextResponse.json({ error: 'Speech synthesis failed' }, { status: 500 })
  }
}


