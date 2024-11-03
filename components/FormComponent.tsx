"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { generatePrompt, generateCopyPrompt } from "@/utils/generatePrompt"
import { Download, Copy } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import { AlertCircle } from "lucide-react"
import Image from "next/image"
import { toast } from 'react-toastify'
import { AnimatedModal } from "@/components/ui/animated-modal"

const formSchema = z.object({
  storeName: z.string().optional(),
  storeAddress: z.string().optional(),
  storePhone: z.string().optional(),
  storeEmail: z.string().email().optional(),
  storeUrl: z.string()
    .optional()
    .transform(val => {
      if (!val) return val;
      if (val.startsWith('http://') || val.startsWith('https://')) return val;
      return `https://${val}`;
    })
    .refine(val => {
      if (!val) return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, 'Please enter a valid URL'),
  assistantUrl: z.string().url().refine(url => {
    const validDomains = [
      'dashboard.themattressai.com',
      'www.dashboard.themattressai.com',
      'chat.themattressai.com',
      'www.chat.themattressai.com'
    ];
    try {
      const parsedUrl = new URL(url);
      return validDomains.includes(parsedUrl.hostname);
    } catch {
      return false;
    }
  }, 'To use this feature, you must be a MattressAI Retail partner. Please click "Sign up for MattressAI" to get started.'),
  platform: z.string().min(1, 'Please select a platform'),
  storeDescription: z.string().optional(),
  adIdeas: z.string().optional(),
  metaphor: z.string().optional(),
  style: z.string().optional(),
  colors: z.string().optional(),
}).strict()

type FormData = {
  storeName: string
  storeAddress: string
  storePhone: string
  storeEmail: string
  storeUrl: string
  assistantUrl: string
  platform: string
  storeDescription: string
  adIdeas: string
  metaphor: string
  style: string
  colors: string
}

export function FormComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [suggestedCopy, setSuggestedCopy] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storeName: '',
      storeAddress: '',
      storePhone: '',
      storeEmail: '',
      storeUrl: '',
      assistantUrl: '',
      platform: '',
      storeDescription: '',
      adIdeas: '',
      metaphor: '',
      style: '',
      colors: '',
    },
  })

  const sendWebhookData = async (data: Partial<FormData>, action: 'signup' | 'generate') => {
    try {
      await fetch('/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeName: data.storeName,
          storePhone: data.storePhone,
          storeEmail: data.storeEmail,
          action
        }),
      })
    } catch (error) {
      console.error('Failed to send webhook:', error)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError(null)
    setIsLoadingModalOpen(true)
    
    try {
      // Run both requests in parallel
      const [imageResponse, copyResponse] = await Promise.all([
        fetch('/api/generateImage', {
          method: 'POST',
          body: JSON.stringify({ 
            prompt: generatePrompt({
              platform: data.platform,
              assistantUrl: data.assistantUrl,
              storeName: data.storeName ?? '',
              storeAddress: data.storeAddress ?? '',
              storePhone: data.storePhone ?? '',
              storeEmail: data.storeEmail ?? '',
              storeUrl: data.storeUrl ?? '',
              storeDescription: data.storeDescription ?? '',
              adIdeas: data.adIdeas ?? '',
              metaphor: data.metaphor ?? '',
              style: data.style ?? '',
              colors: data.colors ?? ''
            }),
            platform: data.platform,
            url: data.assistantUrl
          }),
        }),
        fetch('/api/generateCopy', {
          method: 'POST',
          body: JSON.stringify({ 
            prompt: generateCopyPrompt({
              platform: data.platform,
              assistantUrl: data.assistantUrl,
              storeName: data.storeName ?? '',
              storeAddress: data.storeAddress ?? '',
              storePhone: data.storePhone ?? '',
              storeEmail: data.storeEmail ?? '',
              storeUrl: data.storeUrl ?? '',
              storeDescription: data.storeDescription ?? '',
              adIdeas: data.adIdeas ?? '',
              metaphor: data.metaphor ?? '',
              style: data.style ?? '',
              colors: data.colors ?? ''
            })
          }),
        })
      ]);

      // Handle responses
      const [imageData, copyData] = await Promise.all([
        imageResponse.json(),
        copyResponse.json()
      ]);

      if (!imageResponse.ok) throw new Error(imageData.error || 'Failed to generate image')
      if (!copyResponse.ok) throw new Error(copyData.error || 'Failed to generate copy')

      setGeneratedImage(imageData.imageUrl)
      setSuggestedCopy(copyData.suggestedCopy)
      setIsLoadingModalOpen(false)
      setIsDialogOpen(true)
    } catch (error) {
      setIsLoadingModalOpen(false)
      setError(error instanceof Error ? error.message : 'An error occurred')
      form.setError('assistantUrl', {
        type: 'server',
        message: error instanceof Error ? error.message : 'Failed to generate image',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadImage = async (url: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `mattressai-ad-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(link.href) // Clean up the URL object
    } catch (err) {
      console.error('Error downloading image:', err)
      setError('Failed to download image')
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy text:', err)
      setError('Failed to copy text to clipboard')
    }
  }

  const handleSignUp = async () => {
    const formData = form.getValues();
    await sendWebhookData(formData, 'signup');
    window.location.href = 'https://dashboard.themattressai.com/';
  }

  return (
    <TooltipProvider>
      <div className="relative min-h-screen">
        {/* Existing Form Content - now wrapped in relative container */}
        <div className="relative z-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto">
              <div className="space-y-6 bg-zinc-900/50 p-6 rounded-lg border border-white/10">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-white/90">Store Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="storeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. Sweet Dreams Mattress" 
                              {...field} 
                              value={field.value ?? ''} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="storeAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store Address</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 123 Main St, City, State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="storePhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="storeEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store Email</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. sales@yourstore.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="storeUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., https://www.yourstore.com" 
                              {...field} 
                              value={field.value ?? ''} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-white/90">MattressAI Integration</h2>
                  <FormField
                    control={form.control}
                    name="assistantUrl"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel>Assistant URL</FormLabel>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-zinc-400 hover:text-white transition-colors cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Enter your MattressAI Assistant URL
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <FormControl>
                            <Input placeholder="https://mattressai.com/assistant/..." {...field} />
                          </FormControl>
                          <Button 
                            onClick={handleSignUp}
                            className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white py-6 text-lg font-medium rounded-full"
                          >
                            Sign up for MattressAI
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-white/90">Ad Configuration</h2>
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel>Platform</FormLabel>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-zinc-400 hover:text-white transition-colors cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Choose the social media platform for your ad
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-900 border border-white/10">
                            <SelectItem value="Instagram">
                              Instagram (1:1 Square)
                            </SelectItem>
                            <SelectItem value="Facebook">
                              Facebook (Landscape)
                            </SelectItem>
                            <SelectItem value="Twitter">
                              X (Landscape)
                            </SelectItem>
                            <SelectItem value="TikTok">
                              TikTok (Vertical)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="storeDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what makes your store special..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="adIdeas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ad Ideas</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Share your ideas for the ad..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-6 bg-zinc-900/50 p-6 rounded-lg border border-white/10">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-white/90">Visual Preferences</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="metaphor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Metaphor</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a metaphor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-zinc-900 border border-white/10">
                              <SelectItem value="Lost">Lost</SelectItem>
                              <SelectItem value="Confused">Confused</SelectItem>
                              <SelectItem value="Busy">Busy</SelectItem>
                              <SelectItem value="Frustrated">Frustrated</SelectItem>
                              <SelectItem value="any">Any</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="style"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Style</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-zinc-900 border border-white/10">
                              <SelectItem value="Beautiful">Beautiful</SelectItem>
                              <SelectItem value="Surreal">Surreal</SelectItem>
                              <SelectItem value="Abstract">Abstract</SelectItem>
                              <SelectItem value="Calm">Calm</SelectItem>
                              <SelectItem value="any">Any</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="colors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color Palette</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., blue and gold, or #FF5733, #33FF57" 
                            {...field} 
                            className="bg-zinc-950/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button 
                onClick={async (e) => {
                  // Prevent default form submission
                  e.preventDefault()
                  
                  // Send webhook with current values regardless of validation
                  const formData = form.getValues()
                  await sendWebhookData(formData, 'generate')
                  
                  // Continue with normal form submission
                  form.handleSubmit(onSubmit)(e)
                }}
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white py-6 text-lg font-medium rounded-full"
              >
                {isLoading ? 'Generating...' : 'Generate Marketing Content'}
              </Button>

              {error && (
                <div className="flex items-center gap-2 p-4 mt-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </form>
          </Form>

          <AnimatedModal isOpen={isLoadingModalOpen} onClose={() => {}}>
            <div className="p-8 flex flex-col items-center justify-center space-y-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-semibold text-white/90">Generating Your Content</h3>
                <p className="text-white/70">This usually takes about 30 seconds...</p>
              </div>
              <div className="w-full max-w-md space-y-2">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 w-full animate-[loading_2s_ease-in-out_infinite]"></div>
                </div>
              </div>
            </div>
          </AnimatedModal>

          <AnimatedModal isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
            <div className="p-6 space-y-6">
              <h2 className="text-2xl font-semibold text-white/90">Generated Content</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generatedImage && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white/90">Marketing Image</h3>
                    <div className="relative rounded-lg overflow-hidden border border-white/10">
                      <Image 
                        src={generatedImage}
                        alt="Generated marketing image"
                        width={512}
                        height={512}
                        className="w-full h-auto"
                        unoptimized={generatedImage.startsWith('data:')}
                      />
                      <Button
                        onClick={() => downloadImage(generatedImage)}
                        className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}

                {suggestedCopy && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white/90">Marketing Copy</h3>
                    <div className="relative rounded-lg overflow-hidden border border-white/10">
                      <textarea
                        value={suggestedCopy}
                        readOnly
                        className="w-full h-[300px] p-4 bg-black/20 text-white/90 resize-none"
                      />
                      <Button
                        onClick={() => copyToClipboard(suggestedCopy)}
                        className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </AnimatedModal>
        </div>
      </div>
    </TooltipProvider>
  )
} 