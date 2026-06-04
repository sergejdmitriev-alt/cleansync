import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import BottomNav from './components/BottomNav'

const jakarta = Plus_Jakarta_Sans({
  subsets:  ['latin'],
  display:  'swap',
  weight:   ['400', '500', '600'],
})

export const metadata: Metadata = {
  title:       'CleanSync',
  description: 'Reinigungsmanagement für Airbnb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={jakarta.className}>
        {children}
        <BottomNav />
      </body>
    </html>
  )
}
