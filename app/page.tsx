import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import Header from './components/Header'
import TasksFilter from './components/TasksFilter'

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
    total:   tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    active:  tasks.filter(t => ['sent', 'accepted'].includes(t.status)).length,
    done:    tasks.filter(t => t.status === 'done').length,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cs-bg)' }}>
      <Header />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>

        {/* Stats */}
        <div className="cs-stats-grid">
          {[
            { label: 'Gesamt',         value: counts.total,   color: 'var(--cs-text-1)' },
            { label: 'Ausstehend',     value: counts.pending, color: 'var(--cs-text-2)' },
            { label: 'In Bearbeitung', value: counts.active,  color: 'var(--cs-blue)'   },
            { label: 'Erledigt',       value: counts.done,    color: '#059669'           },
          ].map(s => (
            <div key={s.label} className="cs-card" style={{ padding: '16px 20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--cs-text-3)', margin: '0 0 6px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {s.label}
              </p>
              <p style={{ fontSize: '34px', fontWeight: '600', color: s.color, margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <TasksFilter tasks={tasks} />

      </main>
    </div>
  )
}
