import type { Metadata, Viewport } from 'next'
import { Navigation } from '@/components/navigation'
import { WageProvider } from '@/context/WageContext'
import './globals.css'

export const metadata: Metadata = {
  title: '인건비 대시보드',
  description: '실시간 인상률 조정 및 인건비 배분 최적화 대시보드',
  keywords: '인건비, 급여, 임금, 대시보드, HR, 인사관리',
  authors: [{ name: '인사팀' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0ea5e9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        <WageProvider>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
        </WageProvider>
      </body>
    </html>
  )
}