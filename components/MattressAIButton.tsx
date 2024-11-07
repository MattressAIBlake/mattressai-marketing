"use client"

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export function MattressAIButton() {
  const handleButtonClick = () => {
    if (!document.querySelector("script[src='https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js']")) {
      const script = document.createElement('script');
      script.src = 'https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js';
      script.type = 'module';
      script.async = true;
      document.body.appendChild(script);
    }

    const chatbot = document.createElement('zapier-interfaces-chatbot-embed');
    chatbot.setAttribute('is-popup', 'false');
    chatbot.setAttribute('chatbot-id', 'cm37j1u37001etupfikelcljv');
    chatbot.setAttribute('height', '600px');
    chatbot.setAttribute('width', '400px');
    
    // Center the chatbot
    chatbot.style.position = 'fixed';
    chatbot.style.top = '50%';
    chatbot.style.left = '50%';
    chatbot.style.transform = 'translate(-50%, -50%)';
    chatbot.style.zIndex = '1000'; // Ensure it's on top

    document.body.appendChild(chatbot);

    // Add event listener to close chatbot on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (!chatbot.contains(event.target as Node)) {
        chatbot.remove();
        document.removeEventListener('click', handleClickOutside);
      }
    };

    document.addEventListener('click', handleClickOutside);
  };

  return (
    <Button
      className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white py-3 px-6 text-lg rounded-full border-4 border-white"
      onClick={handleButtonClick}
    >
      MattressAI Coach
    </Button>
  )
} 