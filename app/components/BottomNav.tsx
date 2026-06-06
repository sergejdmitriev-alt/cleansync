'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS_LEFT = [
  {
    href: '/',
    label: 'Start',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: '/kalender',
    label: 'Kalender',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
]

const ITEMS_RIGHT = [
  {
    href: '/statistik',
    label: 'Statistik',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Einstell.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  if (pathname === '/login' || pathname === '/lead') return null

  const itemStyle = (active: boolean): React.CSSProperties => ({
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    gap:            '3px',
    flex:           1,
    padding:        '8px 0 4px',
    textDecoration: 'none',
    color:          active ? '#2563eb' : '#9ca3af',
    transition:     'color 0.12s',
  })

  const labelStyle = (active: boolean): React.CSSProperties => ({
    fontSize:   '10px',
    fontWeight: active ? '500' : '400',
    color:      active ? '#2563eb' : '#9ca3af',
  })

  return (
    <nav
      className="cs-bottom-nav"
      style={{
        position:      'fixed',
        bottom:        0,
        left:          0,
        right:         0,
        background:    'var(--cs-surface)',
        borderTop:     '1px solid var(--cs-border)',
        display:       'flex',
        alignItems:    'center',
        zIndex:        50,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {ITEMS_LEFT.map(({ href, icon, label }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href} style={itemStyle(active)}>
            {icon}
            <span style={labelStyle(active)}>{label}</span>
          </Link>
        )
      })}

      {/* FAB */}
      <div style={{
        flex:           1,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        marginTop:      '-16px',
      }}>
        <Link href="/tasks/new" style={{
          width:          '52px',
          height:         '52px',
          borderRadius:   '50%',
          background:     'var(--cs-text-1)',
          color:          'var(--cs-surface)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontSize:       '26px',
          fontWeight:     '300',
          textDecoration: 'none',
          boxShadow:      '0 4px 12px rgba(0,0,0,0.2)',
        }}>
          +
        </Link>
      </div>

      {ITEMS_RIGHT.map(({ href, icon, label }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href} style={itemStyle(active)}>
            {icon}
            <span style={labelStyle(active)}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
