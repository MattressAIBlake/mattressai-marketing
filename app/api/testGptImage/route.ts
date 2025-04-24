import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Simple test endpoint for gpt-image-1
export async function POST(req: Request) {
  console.log('Test gpt-image-1 endpoint called');
  
  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    console.log('Creating OpenAI client with organization ID');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_IMAGE_API_KEY || process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID, 
    });
    
    console.log('Organization ID:', process.env.OPENAI_ORG_ID);
    console.log('API Key (masked):', process.env.OPENAI_IMAGE_API_KEY?.substring(0, 10) + '...');
    
    // Most minimal version of the call
    console.log('Calling gpt-image-1 with prompt:', prompt.substring(0, 50) + '...');
    
    try {
      const response = await openai.images.generate({
        model: 'gpt-image-1',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      });
      
      console.log('Response received:', JSON.stringify(response.data, null, 2));
      
      return NextResponse.json({ 
        success: true,
        url: response.data[0].url,
      });
    } catch (openaiError: any) {
      console.error('OpenAI API Error:', openaiError.message);
      console.error('Full error:', JSON.stringify(openaiError, null, 2));
      
      // Detailed error response
      return NextResponse.json({
        error: 'OpenAI API Error',
        message: openaiError.message,
        status: openaiError?.status || 500,
        type: openaiError?.type || 'unknown',
        details: process.env.NODE_ENV === 'development' ? openaiError : undefined
      }, { status: 500 });
    }
  } catch (error: unknown) {
    console.error('General error:', error);
    
    return NextResponse.json({
      error: 'An unexpected error occurred',
      message: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
} 