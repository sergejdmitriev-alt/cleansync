import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import Header from '@/app/components/Header'

export const dynamic = 'force-dynamic'

export default async function StatistikPage() {
  const serverSupabase = await createServerSupabaseClient()
  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) return null

  const supabase = createServiceSupabaseClient()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

  const { data: tasksData } = await supabase
    .from('tasks')
    .select('id, status, sent_at, accepted_at, done_at, checkout_time, cleaners(name)')
    .eq('user_id', user.id)
    .gte('checkout_time', monthStart)
    .lte('checkout_time', monthEnd)
  const tasks = tasksData ?? []

  const total    = tasks.length
  const accepted = tasks.filter(t => ['accepted', 'done'].includes(t.status)).length
  const declined = tasks.filter(t => t.status === 'declined').length
  const done     = tasks.filter(t => t.status === 'done').length

  const acceptedPct = (accepted + declined) > 0 ? Math.round(accepted / (accepted + declined) * 100) : 0
  const declinedPct = (accepted + declined) > 0 ? Math.round(declined / (accepted + declined) * 100) : 0
  const donePct     = total > 0 ? Math.round(done / total * 100) : 0

  const responseMins = tasks
    .filter(t => t.accepted_at && t.sent_at)
    .map(t => (new Date(t.accepted_at).getTime() - new Date(t.sent_at).getTime()) / 60000)
  const avgMin = responseMins.length > 0
    ? Math.round(responseMins.reduce((a, b) => a + b, 0) / responseMins.length)
    : null

  const weeks = [0, 0, 0, 0]
  tasks.forEach(t => {
    const day = new Date(t.checkout_time).getDate()
    weeks[Math.min(Math.floor((day - 1) / 7), 3)]++
  })
  const maxWeek = Math.max(...weeks, 1)

  const cleanerMap: Record<string, number> = {}
  tasks.filter(t => t.status === 'done').forEach(t => {
    const name = (t.cleaners as any)?.name ?? 'Unbekannt'
    cleanerMap[name] = (cleanerMap[name] ?? 0) + 1
  })
  const topCleaners = Object.entries(cleanerMap).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxDone = topCleaners[0]?.[1] ?? 1

  const monthLabel = now.toLocaleString('de-AT', { month: 'long', year: 'numeric' })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cs-bg)' }}>
      <Header />
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 20px 80px' }}>

        <h1 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--cs-text-1)', margin: '0 0 4px' }}>
          Statistik
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--cs-text-3)', margin: '0 0 24px' }}>{monthLabel}</p>

        {/* 4 stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Aufträge gesamt',  value: String(total),                                   color: 'var(--cs-text-1)' },
            { label: 'Akzeptiert',       value: `${acceptedPct}%`,                               color: '#2563eb'          },
            { label: 'Abgelehnt',        value: String(declined),                                color: 'var(--cs-danger)' },
            { label: 'Ø Antwortzeit',    value: avgMin !== null ? `${avgMin} min` : '—',        color: '#059669'          },
          ].map(s => (
            <div key={s.label} className="cs-card" style={{ padding: '16px 20px' }}>
              <p style={{ fontSize: '11px', color: 'var(--cs-text-3)', margin: '0 0 6px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {s.label}
              </p>
              <p style={{ fontSize: '30px', fontWeight: '700', color: s.color, margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Bar chart by week */}
        <div className="cs-card" style={{ padding: '20px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--cs-text-1)', margin: '0 0 20px' }}>
            Aufträge nach Woche
          </h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '120px' }}>
            {weeks.map((count, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cs-text-2)' }}>{count}</span>
                <div style={{
                  width: '100%',
                  height: `${Math.max(Math.round((count / maxWeek) * 88), count > 0 ? 8 : 3)}px`,
                  background: count > 0 ? 'var(--cs-blue)' : 'var(--cs-border)',
                  borderRadius: '6px 6px 0 0',
                }} />
                <span style={{ fontSize: '11px', color: 'var(--cs-text-3)' }}>W{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Circular indicators */}
        <div className="cs-card" style={{ padding: '20px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--cs-text-1)', margin: '0 0 20px' }}>
            Auftragsverteilung
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {[
              { label: 'Akzeptiert', pct: acceptedPct, color: '#2563eb'          },
              { label: 'Abgelehnt',  pct: declinedPct, color: 'var(--cs-danger)' },
              { label: 'Erledigt',   pct: donePct,     color: '#059669'          },
            ].map(({ label, pct, color }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: `conic-gradient(${color} ${pct * 3.6}deg, var(--cs-border) 0deg)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%',
                    background: 'var(--cs-surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: '700', color,
                  }}>
                    {pct}%
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--cs-text-3)', fontWeight: '500' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top cleaners */}
        {topCleaners.length > 0 && (
          <div className="cs-card" style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--cs-text-1)', margin: '0 0 16px' }}>
              Top Reinigungskräfte (erledigt)
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topCleaners.map(([name, count]) => (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--cs-text-1)' }}>{name}</span>
                    <span style={{ fontSize: '13px', color: 'var(--cs-text-3)' }}>{count}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--cs-border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.round(count / maxDone * 100)}%`,
                      background: '#059669', borderRadius: '3px',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {total === 0 && (
          <div className="cs-card" style={{ padding: '48px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: '36px', margin: '0 0 12px' }}>📊</p>
            <p style={{ fontSize: '15px', color: 'var(--cs-text-2)', margin: 0 }}>Noch keine Daten für diesen Monat</p>
          </div>
        )}

      </main>
    </div>
  )
}
