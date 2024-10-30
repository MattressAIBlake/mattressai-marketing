import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import * as QRCode from 'qrcode';
import sharp from 'sharp'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const sizeMapping = {
  Instagram: '1024x1024',
  Facebook: '1792x1024',
  Twitter: '1024x1024',
  TikTok: '1024x1792',
} as const

type SupportedSize = '1024x1024' | '1792x1024' | '1024x1792'

export async function POST(req: Request) {
  try {
    const { prompt, platform, url } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    if (!platform) {
      return NextResponse.json({ error: 'Platform is required' }, { status: 400 })
    }

    const size = sizeMapping[platform as keyof typeof sizeMapping] || '1024x1024'

    // Generate DALL-E Image
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: size as SupportedSize,
      quality: 'standard',
      style: 'natural',
    })

    const dallEImageUrl = response.data[0].url
    if (!dallEImageUrl) {
      return NextResponse.json({ error: 'Failed to generate image URL' }, { status: 500 })
    }

    // Fetch DALL-E Image Buffer
    const imageResponse = await fetch(dallEImageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    const baseImage = sharp(Buffer.from(imageBuffer))

    // Generate QR Code Buffer
    const qrCodeDataUrl = await QRCode.toDataURL(url, { width: 200, margin: 0 })
    const qrCodeBase64 = qrCodeDataUrl.split(',')[1]
    const qrCodeBuffer = Buffer.from(qrCodeBase64, 'base64')
    const qrCodeImage = sharp(qrCodeBuffer).resize(200, 200)

    // Composite QR Code onto DALL-E Image
    const finalImageBuffer = await baseImage
      .composite([
        {
          input: await qrCodeImage.toBuffer(),
          gravity: 'southeast', // Places the QR code at the bottom right corner
        },
      ])
      .png()
      .toBuffer()

    // Convert Final Image to Base64
    const finalImageBase64 = finalImageBuffer.toString('base64')
    const dataUrl = `data:image/png;base64,${finalImageBase64}`

    return NextResponse.json({ imageUrl: dataUrl })
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}
