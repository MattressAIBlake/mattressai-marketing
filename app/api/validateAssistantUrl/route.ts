import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { assistantUrl } = await req.json()

    if (!assistantUrl) {
      return NextResponse.json(
        { error: 'Assistant URL is required' },
        { status: 400 }
      )
    }

    // Add logging to debug
    console.log('Validating URL:', assistantUrl)

    // Validate URL format
    try {
      const url = new URL(assistantUrl)
      if (
        !['dashboard.themattressai.com', 'www.dashboard.themattressai.com', 
          'chat.themattressai.com', 'www.chat.themattressai.com'].some(domain => url.hostname === domain)
      ) {
        return NextResponse.json(
          { error: 'To use this feature, you must be a MattressAI Retail partner. Please click "Sign up for MattressAI" to get started.' },
          { status: 400 }
        )
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Validate that the assistant exists by making a HEAD request
    try {
      const response = await fetch(assistantUrl, {
        method: 'HEAD',
      })

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Assistant not found' },
          { status: 400 }
        )
      }
    } catch {
      return NextResponse.json(
        { error: 'Unable to validate assistant URL' },
        { status: 400 }
      )
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Error validating assistant URL:', error)
    return NextResponse.json(
      { error: 'Failed to validate assistant URL' },
      { status: 500 }
    )
  }
} 