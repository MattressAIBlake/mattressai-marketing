"use client"

import { FormComponent } from "@/components/FormComponent"
import Image from "next/image"

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      {/* Desktop Background - Fixed Position */}
      <div className="hidden md:block fixed inset-0 -z-10">
        <Image
          src="/images/Background.png"
          alt="Background"
          fill
          sizes="100vw"
          className="object-cover"
          priority
          quality={90}
        />
      </div>
      
      {/* Mobile Background - Fixed Position */}
      <div className="block md:hidden fixed inset-0 -z-10">
        <Image
          src="/images/_mBackground.png"
          alt="Mobile Background"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
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
