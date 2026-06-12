'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import { motion, useReducedMotion } from 'framer-motion'

const DAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

const STATUS_COLOR: Record<string, string> = {
  declined:           '#ef4444',
  reinraum_declined:  '#ef4444',
  sent:               '#3b82f6',
  reinraum_pending:   '#f59e0b',
  accepted:           '#f59e0b',
  reinraum_confirmed: '#f59e0b',
  done:               '#22c55e',
}

const STATUS_LABEL: Record<string, string> = {
  pending:            'Ausstehend',
  sent:               'Gesendet',
  accepted:           'Angenommen',
  declined:           'Abgelehnt',
  done:               'Erledigt',
  reinraum_pending:   'Reinraum – Anfrage',
  reinraum_confirmed: 'Reinraum – Bestätigt',
  reinraum_declined:  'Reinraum – Abgelehnt',
}

// Lower number = higher urgency (shown first)
const STATUS_PRIORITY: Record<string, number> = {
  declined: 0, reinraum_declined: 0,
  sent: 1, reinraum_pending: 1,
  accepted: 2, reinraum_confirmed: 2,
  done: 3,
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getMondayOfWeek(d: Date) {
  const day = d.getDay() // 0=Sun
  const diff = day === 0 ? -6 : 1 - day
  const start = new Date(d)
  start.setDate(d.getDate() + diff)
  return start
}

const navBtnStyle: React.CSSProperties = {
  background:    'var(--cs-surface)',
  border:        '1px solid var(--cs-border)',
  borderRadius:  '8px',
  width:         '32px',
  height:        '32px',
  display:       'flex',
  alignItems:    'center',
  justifyContent:'center',
  cursor:        'pointer',
  fontSize:      '18px',
  color:         'var(--cs-text-1)',
}

export default function KalenderPage() {
  const router = useRouter()
  const reduced = useReducedMotion()
  const [tasks, setTasks]         = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [view, setView]           = useState<'month' | 'week'>('month')
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    fetch('/api/tasks')
      .then(r => r.json())
      .then(data => { setTasks(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  // Group tasks by checkout date
  const tasksByDate: Record<string, any[]> = {}
  tasks.forEach(t => {
    const date = toDateStr(new Date(t.checkout_time))
    if (!tasksByDate[date]) tasksByDate[date] = []
    tasksByDate[date].push(t)
  })

  function getDotColor(dayTasks: any[]): string | null {
    if (!dayTasks?.length) return null
    const sorted = [...dayTasks].sort((a, b) =>
      (STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99)
    )
    return STATUS_COLOR[sorted[0].status] ?? '#94a3b8'
  }

  function handleDayClick(dateStr: string, hasTasks: boolean) {
    if (hasTasks) {
      setSelectedDay(prev => prev === dateStr ? null : dateStr)
    } else {
      router.push(`/tasks/new?date=${dateStr}`)
    }
  }

  function prevMonth() {
    if (view === 'week') {
      setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n })
    } else {
      setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
    }
    setSelectedDay(null)
  }
  function nextMonth() {
    if (view === 'week') {
      setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n })
    } else {
      setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
    }
    setSelectedDay(null)
  }

  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 50) { delta > 0 ? nextMonth() : prevMonth() }
    touchStartX.current = null
  }

  // Build month grid cells
  const year  = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDOW    = (new Date(year, month, 1).getDay() + 6) % 7 // Mon=0 … Sun=6
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const gridCells: (number | null)[] = [
    ...Array<null>(firstDOW).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (gridCells.length % 7 !== 0) gridCells.push(null)

  // Build current week days
  const weekStart = getMondayOfWeek(currentDate)
  const weekDays  = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  const today        = toDateStr(new Date())
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  const monthLabel = view === 'week'
    ? `${weekStart.getDate()}. – ${weekEnd.getDate()}. ${weekEnd.toLocaleString('de-AT', { month: 'long', year: 'numeric' })}`
    : currentDate.toLocaleString('de-AT', { month: 'long', year: 'numeric' })
  const selectedTasks = selectedDay ? (tasksByDate[selectedDay] ?? []) : []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cs-bg)' }}>
      <Header />
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 20px 80px' }}>

        {/* Top row: nav + toggle */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={prevMonth} style={navBtnStyle}>‹</button>
            <h1 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--cs-text-1)', margin: 0, minWidth: '150px', textAlign: 'center' }}>
              {monthLabel}
            </h1>
            <button onClick={nextMonth} style={navBtnStyle}>›</button>
          </div>
          <div style={{ display: 'flex', border: '1px solid var(--cs-border)', borderRadius: '8px', overflow: 'hidden' }}>
            {(['month', 'week'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '6px 14px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                background: view === v ? 'var(--cs-text-1)' : 'var(--cs-surface)',
                color:      view === v ? 'var(--cs-surface)' : 'var(--cs-text-2)',
              }}>
                {v === 'month' ? 'Monat' : 'Woche'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Month view */}
        {view === 'month' && (
          <div className="cs-card" style={{ overflow: 'hidden' }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--cs-border)' }}>
              {DAY_NAMES.map(d => (
                <div key={d} style={{ padding: '8px 0', textAlign: 'center', fontSize: '11px', fontWeight: '600', color: 'var(--cs-text-3)', textTransform: 'uppercase' }}>
                  {d}
                </div>
              ))}
            </div>
            {/* Day cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {gridCells.map((day, idx) => {
                const isLastInRow = idx % 7 === 6
                if (day === null) return (
                  <div key={idx} style={{ minHeight: '52px', borderBottom: '1px solid var(--cs-border)', borderRight: isLastInRow ? 'none' : '1px solid var(--cs-border)' }} />
                )
                const dateStr   = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const dayTasks  = tasksByDate[dateStr] ?? []
                const dotColor  = getDotColor(dayTasks)
                const isToday   = dateStr === today
                const isSelected = dateStr === selectedDay
                return (
                  <div
                    key={idx}
                    onClick={() => handleDayClick(dateStr, dayTasks.length > 0)}
                    style={{
                      minHeight: '52px', padding: '6px',
                      borderBottom: '1px solid var(--cs-border)',
                      borderRight: isLastInRow ? 'none' : '1px solid var(--cs-border)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--cs-surface-2)' : 'transparent',
                    }}
                  >
                    <span style={{
                      fontSize: '13px', fontWeight: isToday ? '700' : '400',
                      width: '24px', height: '24px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isToday ? 'rgba(37,99,235,0.12)' : 'transparent',
                      color: isToday ? '#2563eb' : 'var(--cs-text-1)',
                    }}>
                      {day}
                    </span>
                    {dotColor && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: dotColor }} />}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Week view */}
        {view === 'week' && (
          <div className="cs-card" style={{ overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {weekDays.map((day, i) => {
                const dateStr  = toDateStr(day)
                const dayTasks = tasksByDate[dateStr] ?? []
                const isToday  = dateStr === today
                return (
                  <div key={i} style={{ borderRight: i < 6 ? '1px solid var(--cs-border)' : 'none', padding: '10px 6px', minHeight: '120px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--cs-text-3)', fontWeight: '600', textTransform: 'uppercase' }}>{DAY_NAMES[i]}</div>
                      <div style={{
                        width: '26px', height: '26px', borderRadius: '50%', margin: '3px auto 0',
                        background: isToday ? '#2563eb' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: '600',
                        color: isToday ? '#fff' : 'var(--cs-text-1)',
                      }}>
                        {day.getDate()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {dayTasks.map(t => (
                        <div key={t.id} style={{
                          fontSize: '10px', padding: '3px 5px', borderRadius: '4px',
                          background: STATUS_COLOR[t.status] ? `${STATUS_COLOR[t.status]}20` : 'var(--cs-surface-2)',
                          borderLeft: `2px solid ${STATUS_COLOR[t.status] ?? 'var(--cs-border)'}`,
                          color: STATUS_COLOR[t.status] ?? 'var(--cs-text-2)',
                          fontWeight: '500', lineHeight: 1.3,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {t.properties?.name ?? '—'}
                        </div>
                      ))}
                      {dayTasks.length === 0 && (
                        <button
                          onClick={() => router.push(`/tasks/new?date=${dateStr}`)}
                          style={{ fontSize: '10px', color: 'var(--cs-text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', textAlign: 'left' }}
                        >
                          + Auftrag
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px', paddingLeft: '4px' }}>
          {[
            { color: '#3b82f6', label: 'Gesendet' },
            { color: '#f59e0b', label: 'Angenommen' },
            { color: '#22c55e', label: 'Erledigt' },
            { color: '#ef4444', label: 'Abgelehnt' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
              <span style={{ fontSize: '11px', color: 'var(--cs-text-3)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Selected day panel */}
        {selectedDay && selectedTasks.length > 0 && (
          <div className="cs-card" style={{ marginTop: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--cs-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--cs-text-1)' }}>
                {new Date(`${selectedDay}T12:00`).toLocaleDateString('de-AT', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              <button onClick={() => setSelectedDay(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cs-text-3)', fontSize: '18px', lineHeight: 1 }}>✕</button>
            </div>
            {selectedTasks.map(t => (
              <div key={t.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--cs-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--cs-text-1)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.properties?.name ?? '—'}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--cs-text-3)', margin: 0 }}>
                    {t.send_to_agency ? 'Reinraum' : (t.cleaners?.name ?? '—')}
                    {' · '}
                    {new Date(t.checkout_time).toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })} Uhr
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px',
                    background: STATUS_COLOR[t.status] ? `${STATUS_COLOR[t.status]}20` : 'var(--cs-surface-2)',
                    color: STATUS_COLOR[t.status] ?? 'var(--cs-text-2)',
                  }}>
                    {STATUS_LABEL[t.status] ?? t.status}
                  </span>
                  {t.escalated_at && (
                    <span style={{
                      fontSize: '10px', fontWeight: '600',
                      padding: '2px 6px', borderRadius: '20px',
                      background: 'rgba(245,158,11,0.15)', color: '#fbbf24',
                      border: '1px solid rgba(245,158,11,0.3)',
                    }}>
                      🛡️ Backup
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <p style={{ textAlign: 'center', color: 'var(--cs-text-3)', fontSize: '13px', marginTop: '32px' }}>Wird geladen…</p>
        )}

      </main>
    </div>
  )
}
