'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoutButton } from './TaskActions'

const NAV = [
  { href: '/',           label: 'Aufträge'      },
  { href: '/archive',    label: 'Archiv'        },
  { href: '/kalender',   label: 'Kalender'      },
  { href: '/statistik',  label: 'Statistik'     },
  { href: '/settings',   label: 'Einstellungen' },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header style={{
      background:   'var(--cs-surface)',
      borderBottom: '1px solid var(--cs-border)',
      position:     'sticky',
      top:          0,
      zIndex:       50,
    }}>
      <div style={{
        maxWidth:   '1200px',
        margin:     '0 auto',
        padding:    '0 20px',
        height:     '56px',
        display:    'flex',
        alignItems: 'center',
        gap:        '8px',
      }}>

        {/* Логотип */}
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          textDecoration: 'none', flexShrink: 0, marginRight: '8px',
        }}>
          <span style={{
            fontWeight: '600', fontSize: '15px',
            color: 'var(--cs-text-1)', letterSpacing: '-0.01em',
          }}>✦ CleanSync</span>
        </Link>

        {/* Навигация — только desktop */}
        <nav className="hidden sm:flex" style={{ gap: '2px', flex: 1 }}>
          {NAV.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href} style={{
                padding:        '6px 12px',
                borderRadius:   'var(--cs-radius-sm)',
                fontSize:       '14px',
                fontWeight:     active ? '500' : '400',
                color:          active ? 'var(--cs-text-1)' : 'var(--cs-text-2)',
                background:     active ? 'var(--cs-surface-2)' : 'transparent',
                textDecoration: 'none',
                transition:     'all 0.12s',
              }}>
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Правая часть — только desktop */}
        <div className="hidden sm:flex" style={{ alignItems: 'center', gap: '8px' }}>
          <LogoutButton />
          <Link href="/tasks/new" className="cs-btn-primary" style={{ textDecoration: 'none' }}>
            + Neuer Auftrag
          </Link>
        </div>

        {/* Правая часть — только mobile */}
        <div className="sm:hidden" style={{ marginLeft: 'auto' }}>
          <Link href="/tasks/new" style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            width:          '36px',
            height:         '36px',
            borderRadius:   'var(--cs-radius-md)',
            background:     'var(--cs-text-1)',
            color:          'var(--cs-surface)',
            fontSize:       '22px',
            textDecoration: 'none',
            fontWeight:     '300',
          }}>+</Link>
        </div>

      </div>
    </header>
  )
}
