'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

type SearchResult = {
  id:    string
  label: string
  sub?:  string
  href:  string
  group: string
}

const STATIC_ACTIONS: SearchResult[] = [
  { id: 'new-task',     label: 'Neuer Auftrag',         sub: 'Auftrag erstellen',    href: '/tasks/new',      group: 'Aktionen' },
  { id: 'new-property', label: 'Neue Unterkunft',        sub: 'Unterkunft hinzufügen', href: '/settings#properties', group: 'Aktionen' },
  { id: 'new-cleaner',  label: 'Neue Reinigungskraft',   sub: 'Reinigungskraft hinzufügen', href: '/settings#cleaners', group: 'Aktionen' },
  { id: 'nav-tasks',    label: 'Aufträge',               sub: 'Alle aktiven Aufträge', href: '/',              group: 'Aktionen' },
  { id: 'nav-archive',  label: 'Archiv',                 sub: 'Archivierte Aufträge', href: '/archive',        group: 'Aktionen' },
  { id: 'nav-kalender', label: 'Kalender',               sub: 'Reinigungskalender',   href: '/kalender',       group: 'Aktionen' },
  { id: 'nav-statistik',label: 'Statistik',              sub: 'Auswertungen',          href: '/statistik',      group: 'Aktionen' },
  { id: 'nav-settings', label: 'Einstellungen',          sub: 'Konto & Integrationen', href: '/settings',      group: 'Aktionen' },
]

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function CommandPalette() {
  const [open, setOpen]           = useState(false)
  const [query, setQuery]         = useState('')
  const [results, setResults]     = useState<SearchResult[]>([])
  const [active, setActive]       = useState(0)
  const [isSearching, setSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef  = useRef<HTMLDivElement>(null)
  const router   = useRouter()
  const debouncedQ = useDebounce(query, 200)

  // keyboard trigger
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement
      const isInput = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ||
                      el.tagName === 'SELECT' || el.isContentEditable

      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) ||
          (e.key === '/' && !isInput)) {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // autofocus
  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // search
  useEffect(() => {
    if (!open) return
    if (!debouncedQ) {
      setResults(STATIC_ACTIONS)
      setActive(0)
      return
    }
    const q = debouncedQ.toLowerCase()
    const staticMatches = STATIC_ACTIONS.filter(
      a => a.label.toLowerCase().includes(q) || (a.sub?.toLowerCase().includes(q) ?? false)
    )

    setSearching(true)
    fetch(`/api/search?q=${encodeURIComponent(debouncedQ)}`)
      .then(r => r.json())
      .then(data => {
        setSearching(false)
        const taskResults: SearchResult[] = (data.tasks ?? []).map((t: any) => ({
          id:    `task-${t.id}`,
          label: t.properties?.name ?? 'Auftrag',
          sub:   t.notes ? t.notes.slice(0, 60) : undefined,
          href:  `/tasks/${t.id}`,
          group: 'Aufträge',
        }))
        const propResults: SearchResult[] = (data.properties ?? []).map((p: any) => ({
          id:    `prop-${p.id}`,
          label: p.name,
          sub:   p.address,
          href:  `/settings`,
          group: 'Unterkünfte',
        }))
        const cleanerResults: SearchResult[] = (data.cleaners ?? []).map((c: any) => ({
          id:    `cleaner-${c.id}`,
          label: c.name,
          href:  `/settings`,
          group: 'Reinigungskräfte',
        }))
        setResults([...staticMatches, ...taskResults, ...propResults, ...cleanerResults])
        setActive(0)
      })
      .catch(() => {
        setSearching(false)
        setResults(staticMatches)
        setActive(0)
      })
  }, [debouncedQ, open])

  const navigate = useCallback((item: SearchResult) => {
    setOpen(false)
    router.push(item.href)
  }, [router])

  // arrow nav + enter
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActive(a => Math.min(a + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActive(a => Math.max(a - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (results[active]) navigate(results[active])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, results, active, navigate])

  // scroll active into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`) as HTMLElement | null
    el?.scrollIntoView({ block: 'nearest' })
  }, [active])

  // group results
  const groups = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    ;(acc[r.group] ??= []).push(r)
    return acc
  }, {})

  let globalIdx = 0

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '12vh',
          }}
        >
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 560,
              margin: '0 16px',
              background: 'rgba(18,18,24,0.92)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 14,
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}
          >
            {/* Input */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Suchen oder navigieren…"
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 15, color: 'var(--cs-text-1)',
                  caretColor: '#3b7ef8',
                }}
              />
              <kbd style={{
                fontSize: 11, color: 'var(--cs-text-3)',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 5, padding: '2px 6px', flexShrink: 0,
              }}>Esc</kbd>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              style={{ maxHeight: 380, overflowY: 'auto', padding: '6px 0' }}
            >
              {isSearching && (
                <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[140, 180, 160].map((w, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div className="cs-skeleton" style={{ width: w, height: 14, borderRadius: 4 }} />
                      <div className="cs-skeleton" style={{ width: w * 0.7, height: 11, borderRadius: 3 }} />
                    </div>
                  ))}
                </div>
              )}
              {!isSearching && results.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--cs-text-3)', fontSize: 13, padding: '24px 0' }}>
                  {debouncedQ ? `Keine Ergebnisse für „${debouncedQ}"` : 'Keine Ergebnisse'}
                </p>
              )}
              {!isSearching && Object.entries(groups).map(([group, items]) => (
                <div key={group}>
                  <p style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
                    color: 'var(--cs-text-3)', textTransform: 'uppercase',
                    padding: '8px 16px 4px', margin: 0,
                  }}>
                    {group}
                  </p>
                  {items.map(item => {
                    const idx = globalIdx++
                    const isActive = idx === active
                    return (
                      <button
                        key={item.id}
                        data-idx={idx}
                        onClick={() => navigate(item)}
                        onMouseEnter={() => setActive(idx)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          width: '100%', padding: '8px 16px',
                          background: isActive ? 'rgba(59,126,248,0.15)' : 'transparent',
                          border: 'none', cursor: 'pointer',
                          textAlign: 'left', borderRadius: 0,
                          borderLeft: isActive ? '2px solid #3b7ef8' : '2px solid transparent',
                          transition: 'background 0.1s',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 14, color: 'var(--cs-text-1)', fontWeight: 500 }}>
                            {item.label}
                          </p>
                          {item.sub && (
                            <p style={{ margin: 0, fontSize: 12, color: 'var(--cs-text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.sub}
                            </p>
                          )}
                        </div>
                        {isActive && (
                          <kbd style={{
                            fontSize: 10, color: 'var(--cs-text-3)',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 4, padding: '1px 5px', flexShrink: 0,
                          }}>↵</kbd>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Desktop-only wrapper — not mounted on mobile (SSR returns null for lg breakpoint check is client-side)
export function CommandPaletteDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  if (!isDesktop) return null
  return <CommandPalette />
}
