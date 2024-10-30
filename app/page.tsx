"use client"

import { useState } from "react"
import { FormComponent } from "@/components/FormComponent"
import Image from "next/image"
import { Modal } from "@/components/ui/modal"

export default function Home() {
  return (
    <main className="min-h-screen p-8 relative">
      <Image
        src="/images/Background.png"
        alt="Background"
        fill
        className="object-cover -z-10"
        priority
        quality={100}
      />
      
      <div className="max-w-3xl mx-auto mb-12 text-center">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
          MattressAI Marketing Generator
        </h1>
        <p className="text-2xl text-white/80 font-medium">
          Marketing that drives shoppers to scan YOUR MattressAI QR code
        </p>
      </div>

      <FormComponent />
    </main>
  )
}
