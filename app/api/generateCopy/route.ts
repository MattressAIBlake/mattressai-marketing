import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a professional marketing copywriter specializing in mattress and sleep-related content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    })

    const suggestedCopy = response.choices[0].message.content?.trim()

    if (!suggestedCopy) {
      throw new Error('No copy generated')
    }

    return NextResponse.json({ suggestedCopy })
  } catch (error) {
    console.error('Error generating copy:', error)
    return NextResponse.json(
      { error: 'Failed to generate copy' },
      { status: 500 }
    )
  }
} 