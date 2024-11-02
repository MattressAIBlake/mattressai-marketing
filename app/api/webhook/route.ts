import { NextResponse } from 'next/server'

const ZAPIER_WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL

export async function POST(req: Request) {
  try {
    const { storeName, storePhone, storeEmail, action } = await req.json()

    if (!ZAPIER_WEBHOOK_URL) {
      console.error('Zapier webhook URL not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    const response = await fetch(ZAPIER_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storeName: storeName || '',
        storePhone: storePhone || '',
        storeEmail: storeEmail || '',
        action: action // 'signup' or 'generate'
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to send webhook')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Failed to send data' }, { status: 500 })
  }
} 