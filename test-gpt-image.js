const { OpenAI } = require('openai');
require('dotenv').config({ path: '.env.local' });

/**
 * Tests the gpt-image-1 model with basic parameters
 */
async function testGptImage() {
  // Basic validation of environment variables
  if (!process.env.OPENAI_IMAGE_API_KEY) {
    console.error('ERROR: OPENAI_IMAGE_API_KEY not found in environment');
    process.exit(1);
  }
  
  if (!process.env.OPENAI_ORG_ID) {
    console.error('ERROR: OPENAI_ORG_ID not found in environment');
    process.exit(1);
  }
  
  console.log('Using organization ID:', process.env.OPENAI_ORG_ID);
  console.log('Using API key (masked):', process.env.OPENAI_IMAGE_API_KEY?.substring(0, 10) + '...');
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_IMAGE_API_KEY,
    organization: process.env.OPENAI_ORG_ID,
  });
  
  try {
    console.log('Testing gpt-image-1 model...');
    const result = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: 'A modern cozy bedroom with a large mattress',
      n: 1,
      size: '1024x1024',
      quality: 'medium',
    });
    
    console.log('Success! Image URL:', result.data[0].url);
    return result.data[0].url;
  } catch (error) {
    console.error('ERROR:', error.message);
    console.error('Details:', error.response?.data || error);
    return null;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testGptImage()
    .then(() => console.log('Test completed'))
    .catch(err => console.error('Unexpected error:', err));
}

module.exports = { testGptImage }; 