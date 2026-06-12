import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import Header from './components/Header'
import TasksFilter from './components/TasksFilter'
import { UpcomingWidget, ActivityWidget, MonthWidget } from './components/DashboardWidgets'
import { FadeInItem } from '@/components/motion/FadeInItem'

export const dynamic = 'force-dynamic'

export default async function Home() {
  let tasks: any[] = []

  try {
    const serverSupabase = await createServerSupabaseClient()
    const { data: { user } } = await serverSupabase.auth.getUser()

    if (user) {
      const supabase = createServiceSupabaseClient()
      const { data, error } = await supabase
        .from('tasks')
        .select('*, properties(*), cleaners(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) console.error('Supabase error:', error)
      const raw = data ?? []
      const sortByDate = (a: any, b: any) =>
        new Date(a.checkout_time).getTime() - new Date(b.checkout_time).getTime()

      tasks = [
        ...raw.filter(t => !t.archived && t.status !== 'done').sort(sortByDate),
        ...raw.filter(t => !t.archived && t.status === 'done').sort(sortByDate),
      ]

      if (tasks.length > 0) {
        const { data: photoRows } = await supabase
          .from('task_photos')
          .select('task_id, photo_type')
          .in('task_id', tasks.map((t: any) => t.id))

        const photoMap: Record<string, { completion: number; problem: number }> = {}
        for (const row of photoRows ?? []) {
          if (!photoMap[row.task_id]) photoMap[row.task_id] = { completion: 0, problem: 0 }
          if (row.photo_type === 'completion') photoMap[row.task_id].completion++
          if (row.photo_type === 'problem')    photoMap[row.task_id].problem++
        }
        tasks = tasks.map((t: any) => ({
          ...t,
          _photos: photoMap[t.id] ?? { completion: 0, problem: 0 },
        }))
      }
    }
  } catch (e) {
    console.error('createClient failed:', e)
  }

  const counts = {
    total:    tasks.length,
    pending:  tasks.filter(t => t.status === 'pending').length,
    active:   tasks.filter(t => ['sent', 'accepted', 'reinraum_pending', 'reinraum_confirmed'].includes(t.status)).length,
    done:     tasks.filter(t => t.status === 'done').length,
    reinraum: tasks.filter(t => ['reinraum_pending', 'reinraum_confirmed', 'reinraum_declined'].includes(t.status)).length,
  }

  // Vienna greeting
  const viennaHour = parseInt(
    new Date().toLocaleString('en-US', { timeZone: 'Europe/Vienna', hour: 'numeric', hour12: false })
  )
  const greeting = viennaHour >= 5 && viennaHour < 12 ? 'Guten Morgen'
    : viennaHour >= 12 && viennaHour < 18 ? 'Guten Tag'
    : 'Guten Abend'

  // Upcoming tasks: next 3 non-done, future checkout_time
  const now = new Date()
  const upcoming = tasks
    .filter(t => !t.archived && t.status !== 'done' && new Date(t.checkout_time) >= now)
    .sort((a, b) => new Date(a.checkout_time).getTime() - new Date(b.checkout_time).getTime())
    .slice(0, 3)

  // Recent activity: 5 most recently updated tasks
  const recentActivity = [...tasks]
    .sort((a, b) =>
      new Date(b.updated_at ?? b.created_at).getTime() -
      new Date(a.updated_at ?? a.created_at).getTime()
    )
    .slice(0, 5)

  // Month stats
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  const monthTasks = tasks.filter(t => {
    const d = new Date(t.checkout_time)
    return d >= monthStart && d <= monthEnd
  })
  const monthDone     = monthTasks.filter(t => t.status === 'done').length
  const monthAccepted = monthTasks.filter(t => ['accepted', 'done'].includes(t.status)).length
  const monthDeclined = monthTasks.filter(t => t.status === 'declined').length
  const monthAcceptedPct = (monthAccepted + monthDeclined) > 0
    ? Math.round(monthAccepted / (monthAccepted + monthDeclined) * 100)
    : null
  const responseMins = monthTasks
    .filter(t => t.accepted_at && t.sent_at)
    .map(t => (new Date(t.accepted_at).getTime() - new Date(t.sent_at).getTime()) / 60000)
  const avgMin = responseMins.length > 0
    ? Math.round(responseMins.reduce((a, b) => a + b, 0) / responseMins.length)
    : null

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', position: 'relative', zIndex: 1 }}>
      <Header />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>

        {/* Greeting — desktop only */}
        <h1 className="hidden md:block" style={{
          fontSize: '22px', fontWeight: '600', color: 'var(--cs-text-1)',
          margin: '0 0 20px', letterSpacing: '-0.02em',
        }}>
          {greeting}
        </h1>

        <div className="dashboard-grid">

          {/* Left column */}
          <div>
            <div className="cs-stats-grid">
              {[
                { label: 'Gesamt',         value: counts.total,    color: 'var(--cs-text-1)' },
                { label: 'Ausstehend',     value: counts.pending,  color: 'var(--cs-text-2)' },
                { label: 'In Bearbeitung', value: counts.active,   color: 'var(--cs-blue)'   },
                { label: 'Erledigt',       value: counts.done,     color: '#059669'           },
                { label: 'Reinraum',       value: counts.reinraum, color: '#d97706'           },
              ].map((s, i) => (
                <FadeInItem key={s.label} index={i} className="cs-card" style={{ padding: '16px 20px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--cs-text-3)', margin: '0 0 6px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {s.label}
                  </p>
                  <p style={{ fontSize: '34px', fontWeight: '600', color: s.color, margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>
                    {s.value}
                  </p>
                </FadeInItem>
              ))}
            </div>
            <TasksFilter tasks={tasks} />
          </div>

          {/* Right column — desktop only */}
          <div className="hidden md:flex" style={{ flexDirection: 'column', gap: '16px' }}>
            <FadeInItem index={0}><UpcomingWidget tasks={upcoming} /></FadeInItem>
            <FadeInItem index={1}><ActivityWidget tasks={recentActivity} /></FadeInItem>
            <FadeInItem index={2}><MonthWidget stats={{
              done: monthDone,
              total: monthTasks.length,
              acceptedPct: monthAcceptedPct,
              avgMin,
            }} /></FadeInItem>
          </div>

        </div>
      </main>
    </div>
  )
}
