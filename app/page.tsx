"use client"

import { FormComponent } from "@/components/FormComponent"

export default function Home() {
  return (
    <main 
      className="min-h-screen p-8 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/images/Background.png")' }}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-extrabold text-white mb-4 text-center tracking-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] bg-clip-text">
          <span className="bg-gradient-to-r from-white via-blue-100 to-white text-transparent bg-clip-text">
            MattressAI Marketing Generator
          </span>
        </h1>
        <p className="text-xl text-white text-center mb-12 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-md">
          Generate professional marketing materials to showcase your MattressAI Assistant 
          and attract more qualified leads for your mattress store
        </p>
        <FormComponent />
      </div>
    </main>
  )
}
