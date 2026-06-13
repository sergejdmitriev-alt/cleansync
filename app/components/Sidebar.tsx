'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { LogoutButton } from '@/app/components/TaskActions'

type NavItem = {
  href: string
  label: string
  active: (p: string) => boolean
  icon: React.ReactNode
}

function ListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  )
}
function ArchiveIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/>
      <line x1="10" y1="12" x2="14" y2="12"/>
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}
function StatsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  )
}
function HelpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
}
function GearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}

// Only real existing UI pages — no 404 links
const NAV: NavItem[] = [
  { href: '/',          label: 'Aufträge',  active: p => p === '/' || p.startsWith('/tasks'),    icon: <ListIcon /> },
  { href: '/archive',   label: 'Archiv',   active: p => p === '/archive',                        icon: <ArchiveIcon /> },
  { href: '/kalender',  label: 'Kalender', active: p => p.startsWith('/kalender'),               icon: <CalendarIcon /> },
  { href: '/statistik', label: 'Statistik',active: p => p.startsWith('/statistik'),              icon: <StatsIcon /> },
  { href: '/hilfe',     label: 'Hilfe',    active: p => p.startsWith('/hilfe'),                  icon: <HelpIcon /> },
]

export const PUBLIC_PATHS = ['/login', '/lead', '/connect-telegram']
const ACTIVE_SPRING = { type: 'spring' as const, stiffness: 380, damping: 32 }

const itemStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: 10,
  height: 44, padding: '0 12px', borderRadius: 10,
  textDecoration: 'none', position: 'relative',
  color: isActive ? 'var(--cs-text-1)' : 'var(--cs-text-2)',
  fontSize: 14, fontWeight: isActive ? 500 : 400,
  transition: 'color 0.15s',
})

function ActiveBg() {
  return (
    <motion.div
      layoutId="nav-active"
      style={{
        position: 'absolute', inset: 0, borderRadius: 10,
        background: 'rgba(64,118,235,0.14)',
        borderLeft: '3px solid #3b7ef8',
      }}
      transition={ACTIVE_SPRING}
    />
  )
}

export default function Sidebar({ email }: { email?: string }) {
  const pathname = usePathname()
  const reduced = useReducedMotion()

  if (PUBLIC_PATHS.includes(pathname)) return null

  // First-match wins → each pathname activates exactly one item
  const activeIdx = NAV.findIndex(({ active }) => active(pathname))
  const settingsActive = pathname.startsWith('/settings')

  return (
    <>
      <style>{`
        .sb-link:hover { background: rgba(255,255,255,0.05); }
      `}</style>
      <motion.aside
        className="hidden lg:flex"
        initial={reduced ? false : { x: -16, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        style={{
          position: 'fixed', left: 0, top: 0, bottom: 0, width: 240,
          flexDirection: 'column',
          background: 'rgba(255,255,255,0.03)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          zIndex: 40, padding: '20px 12px',
          overflowY: 'auto',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: 7,
          textDecoration: 'none', marginBottom: 24, padding: '0 8px', flexShrink: 0,
        }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--cs-text-1)', letterSpacing: '-0.01em' }}>
            ✦ CleanSync
          </span>
        </Link>

        {/* Main nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ href, label, icon }, i) => {
            const isActive = i === activeIdx
            return (
              <motion.div
                key={label}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={href}
                  className={isActive ? undefined : 'sb-link'}
                  style={itemStyle(isActive)}
                >
                  {isActive && <ActiveBg />}
                  <span style={{ position: 'relative', zIndex: 1, display: 'flex' }}>{icon}</span>
                  <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Bottom: Einstellungen + profile */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 8 }}>
          <Link
            href="/settings"
            className={settingsActive ? undefined : 'sb-link'}
            style={itemStyle(settingsActive)}
          >
            {settingsActive && <ActiveBg />}
            <span style={{ position: 'relative', zIndex: 1, display: 'flex' }}><GearIcon /></span>
            <span style={{ position: 'relative', zIndex: 1 }}>Einstellungen</span>
          </Link>

          <div style={{
            padding: '10px 12px', marginTop: 4, borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.07)',
          }}>
            {email && (
              <p style={{
                fontSize: 12, color: 'var(--cs-text-2)',
                margin: '0 0 8px', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {email}
              </p>
            )}
            <LogoutButton />
          </div>
        </div>
      </motion.aside>
    </>
  )
}
