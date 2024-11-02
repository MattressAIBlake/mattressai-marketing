import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import * as QRCode from 'qrcode';
import sharp from 'sharp'
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'

export const maxDuration = 60; // 1 minute max for hobby plan
export const dynamic = 'force-dynamic';

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

// Remove the createQRCodeOverlay function and replace with simpler QR code generation
const createQRCode = async (url: string) => {
  // Generate white QR code with transparency
  const qrCodeDataUrl = await QRCode.toDataURL(url, { 
    width: 220,
    margin: 0,
    color: {
      dark: '#FFFFFF',
      light: '#00000000'
    }
  })
  
  const qrCodeBase64 = qrCodeDataUrl.split(',')[1]
  return Buffer.from(qrCodeBase64, 'base64')
}

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

    // Run DALL-E image generation and QR code creation in parallel
    const [dallEResponse, qrCode] = await Promise.all([
      openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: size as SupportedSize,
        quality: 'standard',
        style: 'natural',
      }, {
        timeout: 30000,
      }),
      createQRCode(url)
    ])

    const dallEImageUrl = dallEResponse.data[0].url
    if (!dallEImageUrl) {
      throw new Error('Failed to generate image URL')
    }

    // Fetch the generated image
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    let attempts = 0;
    const maxAttempts = 2;

    let imageResponse;
    while (attempts < maxAttempts) {
      try {
        imageResponse = await fetch(dallEImageUrl, {
          headers: { 'Accept': 'image/*' },
          signal: controller.signal
        });
        if (imageResponse.ok) break;
        attempts++;
      } catch (error) {
        if (attempts === maxAttempts) throw error;
        await new Promise(resolve => setTimeout(resolve, 500 * attempts));
      }
    }

    clearTimeout(timeoutId);

    if (!imageResponse || !imageResponse.ok) {
      throw new Error(`Failed to fetch generated image: ${imageResponse?.status || 'unknown error'}`)
    }

    // Process the image
    const imageBuffer = await imageResponse.arrayBuffer()
    const baseImage = sharp(Buffer.from(imageBuffer))

    // Load your background PNG (you'll need to create this file)
    const qrBackground = await sharp('public/images/qr-background.png')
      .resize(400, 400)
      .toBuffer()

    // Composite QR code onto background, then onto main image
    const qrWithBackground = await sharp(qrBackground)
      .composite([
        {
          input: qrCode,
          top: 90,
          left: 90,
        }
      ])
      .toBuffer()

    const finalImageBuffer = await baseImage
      .composite([
        {
          input: qrWithBackground,
          top: 40,
          left: 40,
        }
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

GlobalFonts.registerFromPath('public/fonts/Inter-Bold.ttf', 'Inter')
