import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import BottomNav from './components/BottomNav'
import Sidebar from './components/Sidebar'
import AuthOnboarding from '@/components/AuthOnboarding'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const jakarta = Plus_Jakarta_Sans({
  subsets:  ['latin'],
  display:  'swap',
  weight:   ['400', '500', '600'],
})

export const metadata: Metadata = {
  title:       'CleanSync',
  description: 'Reinigungsmanagement für Airbnb',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let showOnboarding = false
  let userEmail: string | undefined
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      userEmail = user.email
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_done')
        .eq('id', user.id)
        .single()
      showOnboarding = !profile?.onboarding_done
    }
  } catch {}

  return (
    <html lang="de">
      <body className={jakarta.className}>
        <div className="cs-bg" aria-hidden="true" />
        <Sidebar email={userEmail} />
        <div className="lg:pl-[240px]">
          {children}
        </div>
        <BottomNav />
        <AuthOnboarding showOnboarding={showOnboarding} />
      </body>
    </html>
  )
}
