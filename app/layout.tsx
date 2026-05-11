import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const notoSans = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto',
  weight: ['400', '500', '700'],
})

export const metadata: Metadata = {
  title: 'Principal Nail Salon | 予約',
  description: 'プリンシパル ネイルサロン オンライン予約',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${notoSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-stone-50 font-sans text-stone-800">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
