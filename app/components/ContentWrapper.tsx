'use client'

import { usePathname } from 'next/navigation'
import { PUBLIC_PATHS } from './Sidebar'

export function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublic = PUBLIC_PATHS.includes(pathname)
  return (
    <div className={isPublic ? '' : 'lg:pl-[240px]'}>
      {children}
    </div>
  )
}
