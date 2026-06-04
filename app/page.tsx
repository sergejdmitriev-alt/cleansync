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
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Gesamt',         value: counts.total,   color: 'text-gray-700' },
            { label: 'Ausstehend',     value: counts.pending, color: 'text-gray-500' },
            { label: 'In Bearbeitung', value: counts.active,  color: 'text-blue-600' },
            { label: 'Erledigt',       value: counts.done,    color: 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <TasksFilter tasks={tasks} />
      </main>
    </div>
  )
}
