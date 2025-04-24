import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import * as QRCode from 'qrcode';
import sharp from 'sharp'
import { join } from 'path'
import { readFile } from 'fs/promises'

export const maxDuration = 60; // 1 minute max for hobby plan
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_IMAGE_API_KEY || process.env.OPENAI_API_KEY,
  // Using gpt-image-1 model for enhanced image generation capabilities
})

const sizeMapping = {
  Instagram: '1024x1024',
  Facebook: '1792x1024',
  Twitter: '1024x1024',
  TikTok: '1024x1792',
} as const

// Updated for gpt-image-1 model which supports these dimensions
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
  const startTime = Date.now()
  try {
    const { prompt, platform, url } = await req.json()

    // Add detailed logging
    console.log('Starting image generation with:', {
      platform,
      promptLength: prompt?.length,
      urlProvided: !!url
    })

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
    try {
      const [dallEResponse, qrCode] = await Promise.all([
        openai.images.generate({
          model: 'gpt-image-1',
          prompt,
          n: 1,
          size: size as SupportedSize,
          quality: 'hd',
        }, {
          timeout: 45000,
        }),
        createQRCode(url)
      ])

      console.log('OpenAI response received:', {
        hasUrl: !!dallEResponse.data[0]?.url,
        qrCodeSize: qrCode?.length
      })

      const dallEImageUrl = dallEResponse.data[0].url
      if (!dallEImageUrl) {
        throw new Error('Failed to generate image URL')
      }

      // Fetch the generated image
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const imageResponse = await fetch(dallEImageUrl, {
        headers: { 'Accept': 'image/*' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!imageResponse || !imageResponse.ok) {
        throw new Error(`Failed to fetch generated image: ${imageResponse?.status || 'unknown error'}`)
      }

      // Process the image with better error handling
      try {
        const imageBuffer = await imageResponse.arrayBuffer()
        const baseImage = sharp(Buffer.from(imageBuffer))

        // Load background with error handling
        let qrBackground: Buffer
        try {
          // First try process.cwd() for production
          qrBackground = await readFile(join(process.cwd(), 'public', 'images', 'qr-background.png'))
        } catch (err) {
          console.error('Error loading QR background from cwd:', err)
          // Fallback to absolute path for development
          try {
            qrBackground = await readFile(join('.', 'public', 'images', 'qr-background.png'))
          } catch (fallbackErr) {
            console.error('Error loading QR background from relative path:', fallbackErr)
            throw new Error('Failed to load QR background image')
          }
        }

        // Use sharp with the loaded buffer
        const resizedQrBackground = await sharp(qrBackground)
          .resize(400, 400)
          .toBuffer()

        // Composite QR code onto background, then onto main image
        const qrWithBackground = await sharp(resizedQrBackground)
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

        console.log(`Image generation took ${Date.now() - startTime}ms`)
        return NextResponse.json({ imageUrl: dataUrl })
      } catch (imageError: unknown) {
        console.error('Image processing error:', imageError)
        return NextResponse.json({
          error: 'Failed to process the generated image. Please try again.',
          details: process.env.NODE_ENV === 'development' ? 
            (imageError instanceof Error ? imageError.message : String(imageError)) : 
            undefined
        }, { status: 500 })
      }

    } catch (openaiError: unknown) {
      console.error('OpenAI or QR code generation error:', openaiError)
      return NextResponse.json({
        error: 'Failed to generate image content. Please try again.',
        details: process.env.NODE_ENV === 'development' ? 
          (openaiError instanceof Error ? openaiError.message : String(openaiError)) : 
          undefined
      }, { status: 500 })
    }

  } catch (error: unknown) {
    console.error('Top level error:', error)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return NextResponse.json({ 
          error: 'The request took too long to complete. Please try again.' 
        }, { status: 504 })
      }
    }

    return NextResponse.json({
      error: "An error occurred while generating the image. Please try again.",
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : String(error)) : 
        undefined
    }, { status: 500 })
  }
}
