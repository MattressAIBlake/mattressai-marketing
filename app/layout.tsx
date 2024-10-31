import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MattressAI Marketing',
  description: 'Generate AI marketing content for your mattress store',
  icons: {
    icon: {
      url: '/logo.png',
      type: 'image/png',
    },
    shortcut: { url: '/logo.png', type: 'image/png' },
    apple: { url: '/logo.png', type: 'image/png' },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
