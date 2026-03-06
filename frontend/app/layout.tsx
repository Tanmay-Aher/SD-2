import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'

import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata: Metadata = {
  title: 'EduDash - Education Management Dashboard',
  description: 'A modern education SaaS dashboard with role-based views for students, teachers, and administrators.',
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_inter.variable} ${_jetbrainsMono.variable} min-h-screen bg-background font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
