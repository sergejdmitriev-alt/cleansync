import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import Header from '@/app/components/Header'
import RestoreButton from '@/app/components/RestoreButton'

export const dynamic = 'force-dynamic'

export default async function ArchivePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceSupabaseClient()
  const { data: tasks, error } = await service
    .from('tasks')
    .select(`
      id,
      status,
      checkout_time,
      checkin_time,
      notes,
      done_at,
      properties ( name, address ),
      cleaners ( name )
    `)
    .eq('user_id', user.id)
    .eq('archived', true)
    .order('done_at', { ascending: false })

  if (error) console.error('Archiv-Fehler:', error)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">📦 Archiv</h1>

        {!tasks || tasks.length === 0 ? (
          <p className="text-gray-500">Keine archivierten Aufgaben.</p>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const property = (Array.isArray(task.properties) ? task.properties[0] : task.properties) as { name: string; address: string } | null
              const cleaner  = (Array.isArray(task.cleaners)   ? task.cleaners[0]   : task.cleaners)   as { name: string } | null

              return (
                <div
                  key={task.id}
                  className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{property?.name ?? '—'}</p>
                    <p className="text-sm text-gray-500">{property?.address}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Reinigungskraft: {cleaner?.name ?? '—'}
                    </p>
                    {task.done_at && (
                      <p className="text-xs text-gray-300 mt-1">
                        Abgeschlossen: {new Date(task.done_at).toLocaleDateString('de-AT')}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <RestoreButton taskId={task.id} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
