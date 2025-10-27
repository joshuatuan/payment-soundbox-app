import { NextRequest, NextResponse } from 'next/server'
import { SpeechClient } from '@google-cloud/speech'

// Initialize Speech-to-Text client with Service Account credentials
const speechClient = new SpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as Blob

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Convert audio to base64
    const arrayBuffer = await audioFile.arrayBuffer()
    const audioBytes = Buffer.from(arrayBuffer).toString('base64')

    // Call Speech-to-Text API using SDK
    const [response] = await speechClient.recognize({
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: 'en-US',
      },
      audio: {
        content: audioBytes,
      },
    })

    // Extract transcript from response
    const transcript = response.results
      ?.map(result => result.alternatives?.[0]?.transcript)
      .join('\n') || ''

    return NextResponse.json({ text: transcript })
  } catch (error) {
    console.error('Error in transcription:', error)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}


