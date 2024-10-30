type PromptData = {
  storeName: string
  storeAddress: string
  storePhone: string
  storeEmail: string
  storeDescription: string
  adIdeas: string
  platform: string
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

  return `
Create a visually stunning and creative marketing image based on the following concept and store details:

CORE CONCEPT:
${data.adIdeas}

STORE CONTEXT:
${data.storeDescription}

CREATIVE DIRECTION:
- Create an attractive, attention-commanding visual
- Design for maximum visual impact in the first 0.5 seconds of viewing
- Use rich colors, or unexpected elements to create intrigue
- Be creative while maintaining premium quality
- Avoid generic or basic mattress product photos

TEXT AND VISUAL REQUIREMENTS:
- The ONLY text in the image should be "Scan toShop with AI"
- Include 2 elegant arrows pointing to the bottom right corner
- Make the arrows and text pop on the image
- DO NOT include QR codes, additional text, or branding elements

COMPOSITION REQUIREMENTS:
- Fill the ENTIRE frame with the main visual - no empty/negative space
- Create edge-to-edge impact that maximizes the available dimensions
- Compose the scene to naturally draw attention to the bottom right corner

TECHNICAL SPECIFICATIONS:
- Format: ${platformInfo.style}
- Dimensions: ${platformInfo.dimensions}
- Photorealistic, high-quality rendering
`.trim()
}

export function generateCopyPrompt(data: PromptData) {
  return `
Create compelling marketing copy for a mattress store with the following details:

STORE INFORMATION:
${data.storeName} | ${data.storeAddress}
${data.storePhone} | ${data.storeEmail}

STORE DESCRIPTION:
${data.storeDescription}

DESIRED MESSAGE:
${data.adIdeas}

Please write attention-grabbing copy that:
1. Highlights the store's unique value proposition
2. Includes a clear call-to-action that encourages scanning the QR code in the bottom right corner of the image
3. Uses an engaging, conversational tone
4. Incorporates relevant emojis for ${data.platform}
5. Stays within platform-appropriate length
6. Emphasizes comfort, quality, and customer satisfaction

The copy should be optimized for ${data.platform} and complement the marketing image.
`.trim()
} 