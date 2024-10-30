Step 3: Build the User Interface
3.1. Set Up the Main Page
Create the Main Page File:

If you're using the pages directory (Next.js 12 or earlier):

bash
Copy code
touch pages/index.tsx
If you're using the app directory (Next.js 13+ with the app router):

bash
Copy code
mkdir -p app && touch app/page.tsx
Basic Layout Structure:

tsx
Copy code
// pages/index.tsx or app/page.tsx
import { FormComponent } from '@/components/FormComponent';

const HomePage = () => {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">MattressAI Marketing Image Generator</h1>
      <FormComponent />
    </main>
  );
};

export default HomePage;
3.2. Create the Form Component
Create the Component File:

bash
Copy code
mkdir -p components && touch components/FormComponent.tsx
Import Necessary Libraries and Components:

tsx
Copy code
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectItem } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
Define Form Validation Schema with Zod:

tsx
Copy code
const formSchema = z.object({
  storeName: z.string().nonempty({ message: 'Store name is required' }),
  storeAddress: z.string().nonempty({ message: 'Store address is required' }),
  storePhone: z.string().nonempty({ message: 'Store phone number is required' }),
  storeEmail: z.string().email({ message: 'Enter a valid email address' }),
  assistantUrl: z.string().url({ message: 'Enter a valid URL' }),
  platform: z.string().nonempty({ message: 'Select a platform' }),
  storeDescription: z.string().nonempty({ message: 'Store description is required' }),
  adIdeas: z.string().nonempty({ message: 'Ad ideas are required' }),
});
Implement the Form Component:

tsx
Copy code
const FormComponent = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: any) => {
    // Handle form submission
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {/* Store Name */}
      <FormField>
        <FormItem>
          <FormLabel>Store Name</FormLabel>
          <FormControl>
            <Input {...register('storeName')} placeholder="Enter your store name" />
          </FormControl>
          {errors.storeName && <p className="text-red-500">{errors.storeName.message}</p>}
        </FormItem>
      </FormField>

      {/* Repeat similar blocks for other fields... */}

      {/* Submit Button */}
      <Button type="submit" className="mt-4">Generate Images</Button>
    </Form>
  );
};

export { FormComponent };
3.3. Add Platform Selection Field
Implement Platform Selection:

tsx
Copy code
<FormField>
  <FormItem>
    <FormLabel>Platform for Marketing Image</FormLabel>
    <FormControl>
      <Select {...register('platform')}>
        <SelectItem value="">Select a platform</SelectItem>
        <SelectItem value="Instagram">Instagram</SelectItem>
        <SelectItem value="Facebook">Facebook</SelectItem>
        <SelectItem value="Twitter">Twitter</SelectItem>
        {/* Add more platforms as needed */}
      </Select>
    </FormControl>
    {errors.platform && <p className="text-red-500">{errors.platform.message}</p>}
  </FormItem>
</FormField>
Step 4: Form Handling and Validation
4.1. Implement Form State Management
Install React Hook Form and Zod Resolver:

bash
Copy code
npm install react-hook-form @hookform/resolvers zod
Set Up the Form with React Hook Form:

tsx
Copy code
// Already implemented in FormComponent using useForm
4.2. Client-Side Validation
Add Validation Messages:

tsx
Copy code
{errors.storeEmail && <p className="text-red-500">{errors.storeEmail.message}</p>}
Ensure All Required Fields are Validated:

The Zod schema ensures that each field is validated according to your requirements.
4.3. Validate MattressAI Assistant URL
Add Regex Pattern Validation (Optional):

tsx
Copy code
const assistantUrlPattern = /^https?:\/\/(www\.)?mattressai\.com\/assistant\/.+$/;

const formSchema = z.object({
  // ...other fields
  assistantUrl: z
    .string()
    .regex(assistantUrlPattern, { message: 'Enter a valid MattressAI Assistant URL' }),
  // ...other fields
});
4.4. Server-Side Validation
Create an API Endpoint for Validation:

bash
Copy code
touch pages/api/validateAssistantUrl.ts
ts
Copy code
// pages/api/validateAssistantUrl.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { assistantUrl } = req.body;

  // Implement your logic to validate the URL against your database or service
  const isValid = true; // Replace with actual validation

  if (isValid) {
    res.status(200).json({ valid: true });
  } else {
    res.status(400).json({ error: 'Invalid MattressAI Assistant URL' });
  }
}
Call This Endpoint on Form Submission Before Proceeding:

tsx
Copy code
const onSubmit = async (data: any) => {
  // Validate assistant URL
  const response = await fetch('/api/validateAssistantUrl', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assistantUrl: data.assistantUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    // Display error message
    setError('assistantUrl', { type: 'server', message: errorData.error });
    return;
  }

  // Proceed with prompt generation and API calls
};
Step 5: Compile the Prompt
5.1. Create Prompt Generation Logic
Create a Utility Function:

bash
Copy code
mkdir -p utils && touch utils/generatePrompt.ts
ts
Copy code
// utils/generatePrompt.ts
export const generatePrompt = (data: any) => {
  const customInstructions = `Please create a high-quality marketing image that captures the essence of the store and appeals to our target audience.`;

  return `
    Create a marketing image for ${data.storeName}, located at ${data.storeAddress}.
    Store Phone: ${data.storePhone}, Email: ${data.storeEmail}.
    The store specializes in ${data.storeDescription}.
    Ideas for the ad: ${data.adIdeas}.
    Platform: ${data.platform}.
    Additional Instructions: ${customInstructions}.
  `;
};
5.2. Adjust Prompt Based on Platform
Include Platform-Specific Instructions:

ts
Copy code
const platformInstructions = {
  Instagram: 'The image should be 1080x1080 pixels, suitable for Instagram feed posts.',
  Facebook: 'The image should be 1200x628 pixels, optimized for Facebook ads.',
  Twitter: 'The image should be 1024x512 pixels, suitable for Twitter posts.',
};

export const generatePrompt = (data: any) => {
  const customInstructions = `Please create a high-quality marketing image that captures the essence of the store and appeals to our target audience.`;

  const platformSpecific = platformInstructions[data.platform] || '';

  return `
    Create a marketing image for ${data.storeName}, located at ${data.storeAddress}.
    Store Phone: ${data.storePhone}, Email: ${data.storeEmail}.
    The store specializes in ${data.storeDescription}.
    Ideas for the ad: ${data.adIdeas}.
    Platform: ${data.platform}.
    ${platformSpecific}
    Additional Instructions: ${customInstructions}.
  `;
};
Step 6: Integrate OpenAI APIs
6.1. Set Up API Routes
Create API Route for Image Generation:

bash
Copy code
touch pages/api/generateImage.ts
ts
Copy code
// pages/api/generateImage.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt } = req.body;

  try {
    const response = await openai.createImage({
      prompt,
      n: 1,
      size: '1024x1024', // Adjust size as needed
    });

    const imageUrl = response.data.data[0].url;
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Image generation failed' });
  }
}
Create API Route for Suggested Copy:

bash
Copy code
touch pages/api/generateCopy.ts
ts
Copy code
// pages/api/generateCopy.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt } = req.body;

  try {
    const response = await openai.createCompletion({
      model: 'gpt-4',
      prompt,
      max_tokens: 150,
      temperature: 0.7,
    });

    const suggestedCopy = response.data.choices[0].text.trim();
    res.status(200).json({ suggestedCopy });
  } catch (error) {
    console.error('Error generating copy:', error);
    res.status(500).json({ error: 'Copy generation failed' });
  }
}
6.2. Update Form Submission Handler
Modify the onSubmit Function:

tsx
Copy code
const [generatedImage, setGeneratedImage] = useState<string | null>(null);
const [suggestedCopy, setSuggestedCopy] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);

const onSubmit = async (data: any) => {
  setIsLoading(true);
  setError(null);

  try {
    const prompt = generatePrompt(data);

    // Generate Image
    const imageResponse = await fetch('/api/generateImage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!imageResponse.ok) {
      throw new Error('Failed to generate image');
    }

    const imageData = await imageResponse.json();
    setGeneratedImage(imageData.imageUrl);

    // Generate Suggested Copy
    const copyResponse = await fetch('/api/generateCopy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!copyResponse.ok) {
      throw new Error('Failed to generate copy');
    }

    const copyData = await copyResponse.json();
    setSuggestedCopy(copyData.suggestedCopy);
  } catch (err: any) {
    console.error(err);
    setError('An error occurred while generating content. Please try again or contact Blake at blake@themattressai.com.');
  } finally {
    setIsLoading(false);
  }
};
6.3. Handle Loading States and Errors
Display Loading Indicator:

tsx
Copy code
{isLoading && <p>Loading...</p>}
Display Error Messages:

tsx
Copy code
{error && <div className="text-red-500 mt-4">{error}</div>}
Step 7: Image Display and Download
7.1. Display Generated Image
Render the Image When Available:

tsx
Copy code
{generatedImage && (
  <div className="mt-8">
    <h2 className="text-2xl font-semibold mb-4">Generated Marketing Image</h2>
    <img src={generatedImage} alt="Marketing Image" className="w-full h-auto rounded-md shadow-md" />
    <Button onClick={() => downloadImage(generatedImage)} className="mt-4">Download Image</Button>
  </div>
)}
7.2. Implement Image Download Functionality
Create the downloadImage Function:

tsx
Copy code
const downloadImage = async (url: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'marketing-image.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error('Error downloading image:', err);
  }
};
7.3. Display Suggested Copy with Copy Functionality
Render the Suggested Copy:

tsx
Copy code
{suggestedCopy && (
  <div className="mt-8">
    <h2 className="text-2xl font-semibold mb-4">Suggested Marketing Copy</h2>
    <Textarea value={suggestedCopy} readOnly className="mb-2" />
    <Button onClick={() => copyToClipboard(suggestedCopy)}>Copy to Clipboard</Button>
  </div>
)}
Implement copyToClipboard Function:

tsx
Copy code
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(
    () => {
      alert('Copied to clipboard!');
    },
    (err) => {
      console.error('Could not copy text:', err);
    }
  );
};
Step 8: Additional Features
8.1. Platform-Specific Adjustments
Adjust Image Size Based on Platform:

Modify the size parameter in the image generation API call:

ts
Copy code
// pages/api/generateImage.ts
const sizeMapping = {
  Instagram: '1024x1024',
  Facebook: '1200x628',
  Twitter: '1024x512',
};

const size = sizeMapping[req.body.platform] || '1024x1024';

const response = await openai.createImage({
  prompt,
  n: 1,
  size,
});
8.2. Provide Tooltips and Placeholders
Add Tooltips Using shadcn/ui Components:

tsx
Copy code
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

<FormItem>
  <FormLabel>
    Store Name
    <Tooltip>
      <TooltipTrigger>
        <span className="ml-1 text-gray-500 cursor-pointer">?</span>
      </TooltipTrigger>
      <TooltipContent>Enter the official name of your store.</TooltipContent>
    </Tooltip>
  </FormLabel>
  {/* ... */}
</FormItem>
8.3. Improve User Experience
Disable Submit Button While Loading:

tsx
Copy code
<Button type="submit" disabled={isLoading} className="mt-4">
  {isLoading ? 'Generating...' : 'Generate Images'}
</Button>
Provide Success Messages:

tsx
Copy code
{generatedImage && !error && (
  <div className="text-green-500 mt-4">Content generated successfully!</div>
)}
Step 9: Styling and Theming
9.1. Ensure Consistent Styling
Use shadcn/ui's CSS Variables and Themes:

If you opted to use CSS variables during shadcn/ui setup, you can easily adjust the theme colors.
9.2. Customize the Theme
Modify globals.css or Tailwind Config:

css
Copy code
/* styles/globals.css */
:root {
  --color-primary: #1a202c;
  --color-secondary: #2d3748;
  /* Add more custom properties as needed */
}

9.4. Focus on Accessibility
Use Semantic HTML Elements:

Ensure your markup uses appropriate elements like <label>, <button>, <input>, etc.
Include ARIA Attributes Where Necessary:

tsx
Copy code
<Button aria-label="Generate Marketing Images" type="submit">
  Generate Images
</Button>
Ensure Keyboard Navigability:

Test your application using only the keyboard to navigate and interact.
Provide Sufficient Color Contrast:

Use accessible color combinations for text and backgrounds.