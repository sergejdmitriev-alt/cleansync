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
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'radial-gradient(ellipse 700px 550px at 50% 38%, rgba(17, 85, 204, 0.18) 0%, transparent 68%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        {children}
        <BottomNav />
      </body>
    </html>
  )
}
