import type { Metadata } from 'next'
import './globals.css'
import Layout from '@/components/Layout'
import { leagueSpartan } from '@/lib/fonts'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'Sponsorship Manager',
  description: 'Sponsorship Management Web Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={leagueSpartan.className}>
        <AuthProvider>
          <Layout>
            {children}
          </Layout>
        </AuthProvider>
      </body>
    </html>
  )
}
