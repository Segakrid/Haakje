import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Layout } from '@/components/Layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Haakje - Visvangst Tracker',
  description: 'Houd je visvangsten bij met Haakje. Registreer vangsten, hengels en analyseer je prestaties.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Haakje',
  },
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  )
}
