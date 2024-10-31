import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import * as QRCode from 'qrcode';
import sharp from 'sharp'
import { createCanvas, loadImage } from '@napi-rs/canvas'

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

    // Increase timeout for OpenAI call
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: size as SupportedSize,
      quality: 'standard',
      style: 'natural',
    }, {
      timeout: 300000, // 5 minutes
    })

    const dallEImageUrl = response.data[0].url
    if (!dallEImageUrl) {
      throw new Error('Failed to generate image URL')
    }

    // Increase timeout for fetching the generated image
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes

    const imageResponse = await fetch(dallEImageUrl, {
      headers: {
        'Accept': 'image/*'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch generated image: ${imageResponse.status}`)
    }

    // Rest of the image processing code...
    const imageBuffer = await imageResponse.arrayBuffer()
    const baseImage = sharp(Buffer.from(imageBuffer))

    // Create larger canvas for QR code with gradient background
    const canvas = createCanvas(400, 400)
    const ctx = canvas.getContext('2d')

    // Create rounded rectangle path
    const cornerRadius = 20
    ctx.beginPath()
    ctx.moveTo(cornerRadius, 0)
    ctx.lineTo(400 - cornerRadius, 0)
    ctx.quadraticCurveTo(400, 0, 400, cornerRadius)
    ctx.lineTo(400, 400 - cornerRadius)
    ctx.quadraticCurveTo(400, 400, 400 - cornerRadius, 400)
    ctx.lineTo(cornerRadius, 400)
    ctx.quadraticCurveTo(0, 400, 0, 400 - cornerRadius)
    ctx.lineTo(0, cornerRadius)
    ctx.quadraticCurveTo(0, 0, cornerRadius, 0)
    ctx.closePath()
    
    // Clip to the rounded rectangle
    ctx.clip()

    // Create gradient background with transparency
    const gradient = ctx.createLinearGradient(0, 0, 0, 400)
    gradient.addColorStop(0, 'rgba(26, 38, 52, 0.85)')
    gradient.addColorStop(0.33, 'rgba(44, 62, 80, 0.85)')
    gradient.addColorStop(0.66, 'rgba(52, 73, 94, 0.85)')
    gradient.addColorStop(1, 'rgba(43, 88, 118, 0.85)')

    // Fill background with gradient
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 400, 400)

    // Generate white QR code - smaller relative to canvas
    const qrCodeDataUrl = await QRCode.toDataURL(url, { 
      width: 220,
      margin: 0,
      color: {
        dark: '#FFFFFF',
        light: '#00000000'
      }
    })
    const qrCodeBase64 = qrCodeDataUrl.split(',')[1]
    const qrCodeBuffer = Buffer.from(qrCodeBase64, 'base64')

    // Draw QR code in center with more padding
    const qrImage = await sharp(qrCodeBuffer).toBuffer()
    const qrCodeImg = await loadImage(qrImage)
    ctx.drawImage(qrCodeImg, 90, 90, 220, 220)

    // Add text styling with clean white text
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    
    // Remove all shadows and effects
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    // Top text
    ctx.font = 'bold 42px Arial'
    ctx.fillText('Mattress Match', 200, 55)

    // Bottom text
    ctx.font = 'bold 46px Arial'
    ctx.fillText('Using AI', 200, 355)
    
    // Convert canvas to buffer
    const finalQRBuffer = canvas.toBuffer()

    // Calculate position for top left quadrant
    // Adding some padding from edges
    const qrLeft = 40  // Padding from left edge
    const qrTop = 40   // Padding from top edge

    // Composite QR Code onto DALL-E Image
    const finalImageBuffer = await baseImage
      .composite([
        {
          input: finalQRBuffer,
          top: qrTop,
          left: qrLeft,
        },
      ])
      .png()
      .toBuffer()

    // Convert Final Image to Base64
    const finalImageBase64 = finalImageBuffer.toString('base64')
    const dataUrl = `data:image/png;base64,${finalImageBase64}`

    return NextResponse.json({ imageUrl: dataUrl })
  } catch (error) {
    console.error('Image generation error:', error)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return NextResponse.json({ 
          error: 'The request took too long to complete. Please try again.' 
        }, { status: 504 })
      }
    }

    return NextResponse.json({
      error: "An error occurred while generating the image. Please try again."
    }, { status: 500 })
  }
}
