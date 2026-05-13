import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata = {
  title: 'Resume AI - 智能简历优化',
  description: '你的专属 AI 简历导师',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="zh">
        <body className="bg-slate-100">{children}</body>
      </html>
    </ClerkProvider>
  )
}