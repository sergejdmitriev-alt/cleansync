import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import Link from 'next/link'
import { RefreshButton, SendButton, DeleteButton, ArchiveButton } from './components/TaskActions'
import Header from './components/Header'
import TaskCard from './components/TaskCard'

export const dynamic = 'force-dynamic'

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:  { label: 'Ausstehend',  className: 'bg-gray-100 text-gray-600' },
  sent:     { label: 'Gesendet',    className: 'bg-blue-100 text-blue-700' },
  accepted: { label: 'Angenommen',  className: 'bg-green-100 text-green-700' },
  declined: { label: 'Abgelehnt',   className: 'bg-red-100 text-red-700' },
  done:     { label: 'Erledigt',    className: 'bg-emerald-100 text-emerald-700' },
}

function fmt(dt: string) {
  return new Date(dt).toLocaleString('de-AT', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

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

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Aufträge</h2>
            <RefreshButton />
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-lg font-medium">Noch keine Aufträge</p>
              <Link href="/tasks/new" className="text-blue-500 text-sm mt-2 inline-block">
                Ersten Auftrag erstellen →
              </Link>
            </div>
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wide">
                      <th className="px-6 py-3">Objekt</th>
                      <th className="px-6 py-3">Reinigungskraft</th>
                      <th className="px-6 py-3">Abreise</th>
                      <th className="px-6 py-3">Anreise</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Aktion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tasks.map((task) => {
                      const s = statusConfig[task.status] ?? statusConfig.pending
                      return (
                        <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{task.properties?.name}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[180px]">
                              {task.properties?.address}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-gray-700">{task.cleaners?.name}</td>
                          <td className="px-6 py-4 text-gray-700">{fmt(task.checkout_time)}</td>
                          <td className="px-6 py-4 text-gray-700">{fmt(task.checkin_time)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.className}`}>
                              {s.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <SendButton taskId={task.id} status={task.status} />
                              {task.status === 'done' && <ArchiveButton taskId={task.id} />}
                              <DeleteButton taskId={task.id} />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}
              <div className="sm:hidden divide-y divide-gray-100">
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
