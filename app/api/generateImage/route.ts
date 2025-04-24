import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import * as QRCode from 'qrcode';
import sharp from 'sharp'
import { join } from 'path'
import { readFile } from 'fs/promises'

export const maxDuration = 60; // 1 minute max for hobby plan
export const dynamic = 'force-dynamic';

// Define types for better type safety
type Platform = 'Instagram' | 'Facebook' | 'Twitter' | 'TikTok';
type SupportedSize = '1024x1024' | '1792x1024' | '1024x1792';
interface RequestBody {
  prompt: string;
  platform: Platform;
  url: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_IMAGE_API_KEY || process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID, // Required for gpt-image-1 model
});

// Available sizes for gpt-image-1 model
const sizeMapping: Record<Platform, SupportedSize> = {
  Instagram: '1024x1024',
  Facebook: '1792x1024',
  Twitter: '1024x1024',
  TikTok: '1024x1792',
};

// Remove the createQRCodeOverlay function and replace with simpler QR code generation
const createQRCode = async (url: string): Promise<Buffer> => {
  // Generate white QR code with transparency
  const qrCodeDataUrl = await QRCode.toDataURL(url, { 
    width: 220,
    margin: 0,
    color: {
      dark: '#FFFFFF',
      light: '#00000000'
    }
  });
  
  const qrCodeBase64 = qrCodeDataUrl.split(',')[1];
  return Buffer.from(qrCodeBase64, 'base64');
};

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const { prompt, platform, url } = await req.json() as RequestBody;

    // Add detailed logging
    console.log('Starting image generation with:', {
      platform,
      promptLength: prompt?.length,
      urlProvided: !!url
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!platform) {
      return NextResponse.json({ error: 'Platform is required' }, { status: 400 });
    }

    const size = sizeMapping[platform] || '1024x1024';

    // Generate image and QR code in parallel
    try {
      console.log('Using image model: gpt-image-1');
      
      // Use a typed object with any to support all parameters
      const generateParams: any = {
        model: 'gpt-image-1',
        prompt,
        n: 1,
        size: size,
        quality: 'medium', // Valid options: 'low', 'medium', 'high', 'auto'
        moderation: 'auto', // Options: 'auto', 'low'
      };
      
      const [imageResponse, qrCode] = await Promise.all([
        openai.images.generate(generateParams),
        createQRCode(url)
      ]);

      console.log('OpenAI response received:', {
        responseStructure: JSON.stringify(imageResponse).substring(0, 200),
        hasUrl: !!imageResponse.data[0]?.url,
        qrCodeSize: qrCode?.length
      });

      const imageUrl = imageResponse.data[0].url;
      if (!imageUrl) {
        throw new Error('Failed to generate image URL');
      }

      // Fetch the generated image
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const fetchImageResponse = await fetch(imageUrl, {
        headers: { 'Accept': 'image/*' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!fetchImageResponse || !fetchImageResponse.ok) {
        throw new Error(`Failed to fetch generated image: ${fetchImageResponse?.status || 'unknown error'}`);
      }

      // Process the image with better error handling
      try {
        const imageBuffer = await fetchImageResponse.arrayBuffer();
        const baseImage = sharp(Buffer.from(imageBuffer));

        // Load background with error handling
        let qrBackground: Buffer;
        try {
          // First try process.cwd() for production
          qrBackground = await readFile(join(process.cwd(), 'public', 'images', 'qr-background.png'));
        } catch (err) {
          console.error('Error loading QR background from cwd:', err);
          // Fallback to absolute path for development
          try {
            qrBackground = await readFile(join('.', 'public', 'images', 'qr-background.png'));
          } catch (fallbackErr) {
            console.error('Error loading QR background from relative path:', fallbackErr);
            throw new Error('Failed to load QR background image');
          }
        }

        // Use sharp with the loaded buffer
        const resizedQrBackground = await sharp(qrBackground)
          .resize(400, 400)
          .toBuffer();

        // Composite QR code onto background, then onto main image
        const qrWithBackground = await sharp(resizedQrBackground)
          .composite([
            {
              input: qrCode,
              top: 90,
              left: 90,
            }
          ])
          .toBuffer();

        const finalImageBuffer = await baseImage
          .composite([
            {
              input: qrWithBackground,
              top: 40,
              left: 40,
            }
          ])
          .png()
          .toBuffer();

        // Convert Final Image to Base64
        const finalImageBase64 = finalImageBuffer.toString('base64');
        const dataUrl = `data:image/png;base64,${finalImageBase64}`;

        console.log(`Image generation took ${Date.now() - startTime}ms`);
        return NextResponse.json({ imageUrl: dataUrl });
      } catch (imageError) {
        console.error('Image processing error:', imageError);
        return NextResponse.json({
          error: 'Failed to process the generated image. Please try again.',
          details: process.env.NODE_ENV === 'development' ? 
            (imageError instanceof Error ? imageError.message : String(imageError)) : 
            undefined
        }, { status: 500 });
      }

    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError);
      
      // Check for organization verification error
      const errorObj = openaiError as { status?: number, error?: { message?: string } };
      
      if (errorObj.status === 403 && errorObj.error?.message?.includes('organization must be verified')) {
        return NextResponse.json({ 
          error: 'Organization not verified', 
          message: 'Your OpenAI organization must be verified to use this image model. Please visit https://platform.openai.com/settings/organization/general to verify your organization.',
          details: errorObj.error
        }, { status: 403 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to generate image', 
        message: errorObj instanceof Error ? errorObj.message : 'An error occurred during image generation',
        details: errorObj instanceof Error ? undefined : errorObj.error
      }, { status: errorObj.status || 500 });
    }

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
