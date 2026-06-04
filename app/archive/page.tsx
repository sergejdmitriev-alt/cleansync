import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/components/Header'
import RestoreButton from '@/app/components/RestoreButton'

export default async function ArchivePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceSupabaseClient()
  const { data: tasks, error } = await service
    .from('tasks')
    .select(`id, status, checkout_time, checkin_time, notes, done_at,
             properties(name, address), cleaners(name)`)
    .eq('user_id', user.id)
    .eq('archived', true)
    .order('done_at', { ascending: false })

  if (error) console.error('Archiv-Fehler:', error)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cs-bg)' }}>
      <Header />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>

        {/* Page title */}
        <div style={{ marginBottom: '20px' }}>
          <Link href="/" style={{ fontSize: '13px', color: 'var(--cs-text-3)', textDecoration: 'none' }}>
            ← Zurück
          </Link>
          <h1 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--cs-text-1)', margin: '8px 0 0', letterSpacing: '-0.02em' }}>
            Archiv
          </h1>
        </div>

        {!tasks || tasks.length === 0 ? (
          <div className="cs-card" style={{ padding: '64px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: '36px', margin: '0 0 12px' }}>📦</p>
            <p style={{ fontSize: '15px', fontWeight: '500', color: 'var(--cs-text-2)', margin: 0 }}>
              Keine archivierten Aufträge
            </p>
          </div>
        ) : (
          <div className="cs-card" style={{ overflow: 'hidden' }}>
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--cs-border)',
            }}>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>
                {tasks.length} archivierte {tasks.length === 1 ? 'Auftrag' : 'Aufträge'}
              </h2>
            </div>

            {tasks.map((task, i) => {
              const property = (Array.isArray(task.properties) ? task.properties[0] : task.properties) as { name: string; address: string } | null
              const cleaner  = (Array.isArray(task.cleaners)   ? task.cleaners[0]   : task.cleaners)   as { name: string } | null

              return (
                <div key={task.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '16px', padding: '14px 20px',
                  borderBottom: i < tasks.length - 1 ? '1px solid var(--cs-border)' : 'none',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: '600', fontSize: '14px', margin: '0 0 2px', color: 'var(--cs-text-1)' }}>
                      {property?.name ?? '—'}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--cs-text-3)', margin: '0 0 4px' }}>
                      {property?.address}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--cs-text-3)' }}>
                      <span>👤 {cleaner?.name ?? '—'}</span>
                      {task.done_at && (
                        <span>✓ {new Date(task.done_at).toLocaleDateString('de-AT')}</span>
                      )}
                    </div>
                  </div>
                  <RestoreButton taskId={task.id} />
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
