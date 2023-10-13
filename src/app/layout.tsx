/**************************************************************



***************************************************************/
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import './globals.css';
import { AppProvider } from '@/context/AppContext';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ChatGPT clone',
  description: 'ChatGPTのクローン。Next.js13+Firebase+TypeScript+Tailwind CSS',
}

export default function RootLayout({children}: { children: React.ReactNode }) {
  
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AppProvider>
          {children}
        </AppProvider>
        </body>
    </html>
  )
}
