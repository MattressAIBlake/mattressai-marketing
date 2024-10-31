type PromptData = {
  platform: string;
  assistantUrl: string;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  storeDescription: string;
  adIdeas: string;
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
Create a  marketing image based on the following concept and store details:

CORE CONCEPT:
${data.adIdeas}

STORE CONTEXT:
${data.storeDescription}

Create a  premium-quality image that captures the essence of mattress shopping in an engaging and appealing way. Use rich, vibrant colors to attract attention. Consider incorporating one of the following ideas:

	•	A cozy bedroom setting with elegantly arranged mattresses, showcasing comfort and variety.
	•	A person comfortably floating on a mattress among soft, fluffy clouds, symbolizing the quest for perfect sleep.
	•	An artistic display of mattresses layered or stacked in a visually pleasing pattern, highlighting choice and abundance.

Fill the entire frame with this captivating visual—no empty space—to maximize impact. Ensure the composition naturally guides the viewers eye to the bottom right corner while keeping the left upper quadrant less busy to allow space

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