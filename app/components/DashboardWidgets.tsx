const STATUS_COLOR: Record<string, string> = {
  declined:           '#ef4444',
  reinraum_declined:  '#ef4444',
  sent:               '#3b82f6',
  reinraum_pending:   '#f59e0b',
  accepted:           '#f59e0b',
  reinraum_confirmed: '#22c55e',
  done:               '#22c55e',
  pending:            '#94a3b8',
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2)   return 'gerade eben'
  if (mins < 60)  return `vor ${mins} Minuten`
  const hours = Math.floor(mins / 60)
  if (hours < 2)  return 'vor 1 Stunde'
  if (hours < 24) return `vor ${hours} Stunden`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'gestern'
  return `vor ${days} Tagen`
}

function getActivityText(task: any): string {
  const name = task.send_to_agency ? 'Reinraum' : (task.cleaners?.name ?? 'Reinigungskraft')
  switch (task.status) {
    case 'accepted':           return `${name} hat Auftrag angenommen`
    case 'done':               return `${name} hat Reinigung abgeschlossen`
    case 'declined':           return `${name} hat Auftrag abgelehnt`
    case 'sent':               return `Auftrag an ${name} gesendet`
    case 'reinraum_pending':   return 'Auftrag an Reinraum gesendet'
    case 'reinraum_confirmed': return 'Reinraum hat Auftrag bestätigt'
    case 'reinraum_declined':  return 'Reinraum hat Auftrag abgelehnt'
    default:                   return 'Auftrag erstellt'
  }
}

export function UpcomingWidget({ tasks }: { tasks: any[] }) {
  return (
    <div className="cs-card" style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--cs-text-1)', margin: '0 0 16px' }}>
        Nächste Reinigungen
      </h2>
      {tasks.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--cs-text-3)', margin: 0 }}>Keine anstehenden Aufträge</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {tasks.map(t => {
            const dt = new Date(t.checkout_time)
            const dateLabel = dt.toLocaleDateString('de-AT', { weekday: 'short', day: 'numeric', month: 'short' })
            const timeLabel = dt.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })
            return (
              <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginTop: '4px',
                  background: STATUS_COLOR[t.status] ?? '#94a3b8',
                }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--cs-text-1)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.properties?.name ?? '—'}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--cs-text-3)', margin: '2px 0 0' }}>
                    {dateLabel} · {timeLabel} · {t.send_to_agency ? 'Reinraum' : (t.cleaners?.name ?? '—')}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function ActivityWidget({ tasks }: { tasks: any[] }) {
  return (
    <div className="cs-card" style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--cs-text-1)', margin: '0 0 16px' }}>
        Letzte Aktivität
      </h2>
      {tasks.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--cs-text-3)', margin: 0 }}>Keine Aktivität</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, marginTop: '5px',
                background: STATUS_COLOR[t.status] ?? '#94a3b8',
              }} />
              <p style={{ fontSize: '12px', color: 'var(--cs-text-2)', margin: 0, flex: 1, lineHeight: 1.5 }}>
                {getActivityText(t)}
                {' '}
                <span style={{ color: 'var(--cs-text-3)', fontSize: '11px' }}>
                  — {relativeTime(t.updated_at ?? t.created_at)}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

type MonthStats = {
  done: number
  total: number
  acceptedPct: number | null
  avgMin: number | null
}

export function MonthWidget({ stats }: { stats: MonthStats }) {
  const { done, total, acceptedPct, avgMin } = stats
  const donePct = total > 0 ? Math.round(done / total * 100) : 0

  return (
    <div className="cs-card" style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--cs-text-1)', margin: '0 0 16px' }}>
        Dieser Monat
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Progress bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--cs-text-2)', fontWeight: '500' }}>Erledigt</span>
            <span style={{ fontSize: '12px', color: 'var(--cs-text-3)' }}>{done} / {total}</span>
          </div>
          <div style={{ height: '6px', background: 'var(--cs-border)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '3px', background: '#059669',
              width: `${donePct}%`,
            }} />
          </div>
        </div>

        {/* Two mini stat cards */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1, background: 'var(--cs-surface-2)', borderRadius: '8px', padding: '10px 12px' }}>
            <p style={{ fontSize: '10px', color: 'var(--cs-text-3)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500' }}>
              Akzeptiert
            </p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#2563eb', margin: 0, lineHeight: 1 }}>
              {acceptedPct !== null ? `${acceptedPct}%` : '—'}
            </p>
          </div>
          <div style={{ flex: 1, background: 'var(--cs-surface-2)', borderRadius: '8px', padding: '10px 12px' }}>
            <p style={{ fontSize: '10px', color: 'var(--cs-text-3)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500' }}>
              Ø Antwort
            </p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#059669', margin: 0, lineHeight: 1 }}>
              {avgMin !== null ? `${avgMin}min` : '—'}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
