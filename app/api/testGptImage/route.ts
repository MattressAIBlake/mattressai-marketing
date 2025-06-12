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
      // Correct parameters for gpt-image-1 model
      const params = {
        model: 'gpt-image-1',
        prompt,
        n: 1,
        size: '1024x1024' as const,
      };
      
      const response = await openai.images.generate(params);
      
      console.log('Response received:', JSON.stringify(response.data, null, 2));
      
      // Convert base64 to data URL for display
      const imageB64 = response.data[0].b64_json;
      const dataUrl = `data:image/png;base64,${imageB64}`;
      
      return NextResponse.json({ 
        success: true,
        url: dataUrl, // Return data URL instead of remote URL
        format: 'base64'
      });
    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError instanceof Error ? openaiError.message : 'Unknown error');
      console.error('Full error:', JSON.stringify(openaiError, null, 2));
      
      // Detailed error response
      return NextResponse.json({
        error: 'OpenAI API Error',
        message: openaiError instanceof Error ? openaiError.message : String(openaiError),
        status: (openaiError as { status?: number })?.status || 500,
        type: (openaiError as { type?: string })?.type || 'unknown',
        details: process.env.NODE_ENV === 'development' ? openaiError : undefined
      }, { status: 500 });
    }
  } catch (error) {
    console.error('General error:', error);
    
    return NextResponse.json({
      error: 'An unexpected error occurred',
      message: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
} 