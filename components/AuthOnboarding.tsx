'use client'

import { usePathname } from 'next/navigation'
import OnboardingOverlay from '@/components/onboarding/OnboardingOverlay'

const PUBLIC_PATHS = ['/lead', '/login']

export default function AuthOnboarding({ showOnboarding }: { showOnboarding: boolean }) {
  const pathname = usePathname()
  if (PUBLIC_PATHS.includes(pathname)) return null
  return <OnboardingOverlay showOnboarding={showOnboarding} />
}
