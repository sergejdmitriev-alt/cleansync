'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS_LEFT  = [
  { href: '/',        icon: '🏠', label: 'Start'   },
  { href: '/archive', icon: '📦', label: 'Archiv'  },
]
const ITEMS_RIGHT = [
  { href: '/settings', icon: '⚙️', label: 'Einstell.' },
]

export default function BottomNav() {
  const pathname = usePathname()
  if (pathname === '/login') return null

  const itemStyle = (active: boolean) => ({
    display:        'flex',
    flexDirection:  'column' as const,
    alignItems:     'center',
    gap:            '3px',
    flex:           1,
    padding:        '8px 0 4px',
    fontSize:       '18px',
    textDecoration: 'none',
    color:          active ? 'var(--cs-text-1)' : 'var(--cs-text-3)',
    transition:     'color 0.12s',
  })

  const labelStyle = (active: boolean) => ({
    fontSize:   '10px',
    fontWeight: active ? '500' : '400',
    color:      active ? 'var(--cs-text-1)' : 'var(--cs-text-3)',
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
      {/* Левые пункты */}
      {ITEMS_LEFT.map(({ href, icon, label }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href} style={itemStyle(active)}>
            <span>{icon}</span>
            <span style={labelStyle(active)}>{label}</span>
          </Link>
        )
      })}

      {/* FAB — центральная кнопка */}
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

      {/* Правые пункты */}
      {ITEMS_RIGHT.map(({ href, icon, label }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href} style={itemStyle(active)}>
            <span>{icon}</span>
            <span style={labelStyle(active)}>{label}</span>
          </Link>
        )
      })}

      {/* Пустой слот для симметрии */}
      <div style={{ flex: 1 }} />

    </nav>
  )
}
