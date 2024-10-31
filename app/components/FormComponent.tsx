import React, { useState } from 'react'

// ... existing imports ...

async function onSubmit(data: FormValues) {
  setIsLoading(true)
  setError(null)

  try {
    // Validate assistant URL first
    const urlResponse = await fetch('/api/validateAssistantUrl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assistantUrl: data.assistantUrl }),
    })

    if (!urlResponse.ok) {
      const errorData = await urlResponse.json()
      throw new Error(errorData.error)
    }

    // Run image and copy generation in parallel
    const [imageResponse, copyResponse] = await Promise.all([
      fetch('/api/generateImage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
    ])

    // Handle image response
    if (!imageResponse.ok) {
      const errorData = await imageResponse.json()
      throw new Error(errorData.error || 'Failed to generate image')
    }
    const imageData = await imageResponse.json()
    setGeneratedImage(imageData.imageUrl)

    // Handle copy response
    if (!copyResponse.ok) {
      throw new Error('Failed to generate copy')
    }
    const copyData = await copyResponse.json()
    setSuggestedCopy(copyData.suggestedCopy)

  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred')
    form.setError('assistantUrl', {
      type: 'server',
      message: err instanceof Error ? err.message : 'An error occurred'
    })
  } finally {
    setIsLoading(false)
  }
} 