type PromptData = {
  platform: string;
  assistantUrl: string;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  storeUrl: string;
  storeDescription: string;
  adIdeas: string;
  metaphor: string;
  style: string;
  colors: string;
}

const platformInstructions = {
  Instagram: {
    dimensions: '1080x1080 pixels',
    style: 'square format, vibrant and eye-catching for Instagram feed',
  },
  Facebook: {
    dimensions: '1200x628 pixels',
    style: 'landscape format, optimized for Facebook ads',
  },
  Twitter: {
    dimensions: '1024x512 pixels',
    style: 'landscape format, suitable for Twitter timeline',
  },
  TikTok: {
    dimensions: '1080x1920 pixels',
    style: 'vertical format, optimized for TikTok',
  }
} as const

export function generatePrompt(data: PromptData) {
  const platform = data.platform as keyof typeof platformInstructions
  const platformInfo = platformInstructions[platform]

  const metaphorContext = data.metaphor ? `
EMOTIONAL CONTEXT:
The image should evoke the feeling of someone who is ${data.metaphor.toLowerCase()}, seeking a solution to their sleep problems.` : ''

  const styleDirection = data.style ? `
VISUAL STYLE:
The image should be ${data.style.toLowerCase()} in nature, creating a ${data.style.toLowerCase()} atmosphere.` : ''

  const colorInstructions = data.colors ? `
COLOR PALETTE:
Use these specific colors in the image: ${data.colors}` : ''

  const storeContext = data.storeDescription ? `
STORE CONTEXT:
${data.storeDescription}` : ''

  const concept = data.adIdeas ? `
CORE CONCEPT:
Create an image that incorporates this idea: ${data.adIdeas}` : `
CORE CONCEPT:
Create an appealing mattress store advertisement that emphasizes comfort and quality.`

  return `
Create a marketing image for a mattress store based on the following:
${concept}
Remember to keep the focus on mattresses, bedding, and sleep-related themes regardless of the creative direction.
${storeContext}${metaphorContext}${styleDirection}${colorInstructions}

COMPOSITION REQUIREMENTS:
- Do not include any text or typography in the image
- Position the main focal point on the right side of the image
- Leave subtle negative space in the top left quadrant

Fill the frame completely while maintaining the specified composition requirements.

TECHNICAL SPECIFICATIONS:
- Format: ${platformInfo.style}
- Dimensions: ${platformInfo.dimensions}
- Photorealistic, high-quality rendering
- No text or typography elements
`.trim()
}

export function generateCopyPrompt(data: PromptData) {
  const storeInfo = [
    data.storeName,
    data.storeAddress,
    data.storePhone,
    data.storeEmail,
    data.storeUrl
  ].filter(Boolean).join(' | ')

  const storeInfoSection = storeInfo ? `
STORE INFORMATION:
${storeInfo}` : ''

  const storeDescriptionSection = data.storeDescription ? `
STORE DESCRIPTION:
${data.storeDescription}` : ''

  const messageSection = data.adIdeas ? `
DESIRED MESSAGE:
${data.adIdeas}` : ''

  return `
Create compelling marketing copy for a mattress store:${storeInfoSection}${storeDescriptionSection}${messageSection}

Please write attention-grabbing copy that:
1. Highlights quality sleep and comfort${data.storeName ? ' with emphasis on our store\'s unique value' : ''}
2. Includes a clear call-to-action that encourages scanning the QR code in the bottom right corner of the image
3. Uses an engaging, conversational tone
4. Incorporates relevant emojis for ${data.platform}
5. Stays within platform-appropriate length
6. Emphasizes comfort, quality, and customer satisfaction${data.storeUrl ? `
7. Includes the store's website URL` : ''}

The copy should be optimized for ${data.platform} and complement the marketing image.
`.trim()
} 