import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import BottomNav from './components/BottomNav'
import OnboardingOverlay from '@/components/onboarding/OnboardingOverlay'
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
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
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
        {children}
        <BottomNav />
        <OnboardingOverlay showOnboarding={showOnboarding} />
      </body>
    </html>
  )
}
