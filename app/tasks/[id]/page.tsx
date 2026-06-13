import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/components/Header'
import { FadeInItem } from '@/components/motion/FadeInItem'
import { ProtocolButton } from '@/app/components/ProtocolButton'

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  pending:            { label: 'Ausstehend',          bg: 'var(--cs-pending-bg)',  color: 'var(--cs-pending-text)'  },
  sent:               { label: 'Gesendet',             bg: 'var(--cs-sent-bg)',     color: 'var(--cs-sent-text)'     },
  accepted:           { label: 'Angenommen',           bg: 'var(--cs-accepted-bg)', color: 'var(--cs-accepted-text)' },
  declined:           { label: 'Abgelehnt',            bg: 'var(--cs-declined-bg)', color: 'var(--cs-declined-text)' },
  done:               { label: 'Erledigt',             bg: 'var(--cs-done-bg)',     color: 'var(--cs-done-text)'     },
  reinraum_pending:   { label: 'Reinraum – Anfrage',   bg: 'rgba(245,158,11,0.15)', color: '#fbbf24'                 },
  reinraum_confirmed: { label: 'Reinraum – Bestätigt', bg: 'rgba(34,197,94,0.15)',  color: '#86efac'                 },
  reinraum_declined:  { label: 'Reinraum – Abgelehnt', bg: 'var(--cs-declined-bg)', color: 'var(--cs-declined-text)' },
}

function fmt(dt: string) {
  return new Date(dt).toLocaleString('de-AT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const serverSupabase = await createServerSupabaseClient()
  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) redirect('/login')

  const supabase = createServiceSupabaseClient()

  const { data: task } = await supabase
    .from('tasks')
    .select('*, properties(*), cleaners(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!task) redirect('/')

  const { data: photos } = await supabase
    .from('task_photos')
    .select('*')
    .eq('task_id', id)
    .order('created_at', { ascending: true })

  const photosWithUrls = await Promise.all(
    (photos ?? []).map(async (photo) => {
      const { data } = await supabase.storage
        .from('task-photos')
        .createSignedUrl(photo.storage_path, 3600)
      return { ...photo, url: data?.signedUrl ?? null }
    })
  )

  const completionPhotos = photosWithUrls.filter(p => p.photo_type === 'completion')
  const problemPhotos    = photosWithUrls.filter(p => p.photo_type === 'problem')
  const s = statusConfig[task.status] ?? statusConfig.pending

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', position: 'relative', zIndex: 1 }}>
      <Header />
      <main style={{ maxWidth: '768px', margin: '0 auto', padding: '24px 20px 80px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <Link href="/" style={{ fontSize: '13px', color: 'var(--cs-text-3)', textDecoration: 'none' }}>
          ← Zurück zur Übersicht
        </Link>

        {/* Task details */}
        <FadeInItem index={0} className="cs-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--cs-text-1)', margin: '0 0 4px' }}>
                {task.properties?.name ?? '—'}
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--cs-text-3)', margin: 0 }}>{task.properties?.address}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
              {task.status === 'done' && photosWithUrls.length > 0 && (
                <ProtocolButton taskId={task.id} />
              )}
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '4px 12px', borderRadius: 'var(--cs-radius-full)',
                fontSize: '12px', fontWeight: '500',
                background: s.bg, color: s.color,
              }}>
                {s.label}
              </span>
              {task.escalated_at && (
                <span style={{
                  fontSize: '11px', fontWeight: '600',
                  padding: '3px 10px', borderRadius: 'var(--cs-radius-full)',
                  background: 'rgba(245,158,11,0.15)', color: '#fbbf24',
                  border: '1px solid rgba(245,158,11,0.3)',
                }}>
                  🛡️ Backup aktiv
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '16px', borderTop: '1px solid var(--cs-border)', fontSize: '13px' }}>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--cs-text-3)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500' }}>Reinigungskraft</p>
              <p style={{ margin: 0, fontWeight: '500', color: 'var(--cs-text-1)' }}>
                {task.send_to_agency ? 'Reinraum' : (task.cleaners?.name ?? '—')}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--cs-text-3)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500' }}>Abreise</p>
              <p style={{ margin: 0, fontWeight: '500', color: 'var(--cs-text-1)' }}>{fmt(task.checkout_time)}</p>
            </div>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--cs-text-3)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500' }}>Anreise</p>
              <p style={{ margin: 0, fontWeight: '500', color: 'var(--cs-text-1)' }}>{fmt(task.checkin_time)}</p>
            </div>
            {task.done_at && (
              <div>
                <p style={{ fontSize: '11px', color: 'var(--cs-text-3)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500' }}>Abgeschlossen</p>
                <p style={{ margin: 0, fontWeight: '500', color: 'var(--cs-text-1)' }}>{fmt(task.done_at)}</p>
              </div>
            )}
            {task.notes && (
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={{ fontSize: '11px', color: 'var(--cs-text-3)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500' }}>Notizen</p>
                <p style={{ margin: 0, fontWeight: '500', color: 'var(--cs-text-1)' }}>{task.notes}</p>
              </div>
            )}
          </div>
        </FadeInItem>

        {/* Problem photos */}
        {problemPhotos.length > 0 && (
          <FadeInItem index={1} className="cs-card" style={{ padding: '24px', borderColor: 'var(--cs-danger-border)' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--cs-danger-text)', margin: '0 0 16px' }}>
              ⚠️ Gemeldete Probleme ({problemPhotos.length})
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {problemPhotos.map(photo => (
                <div key={photo.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {photo.url ? (
                    <a href={photo.url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={photo.url}
                        alt="Problem"
                        style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--cs-radius-md)', border: '1px solid var(--cs-danger-border)', opacity: 1, transition: 'opacity 0.15s' }}
                        onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
                        onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                      />
                    </a>
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '1', background: 'var(--cs-surface-2)', borderRadius: 'var(--cs-radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--cs-text-3)' }}>
                      Nicht verfügbar
                    </div>
                  )}
                  {photo.caption && (
                    <p style={{ fontSize: '11px', color: 'var(--cs-text-2)', margin: 0 }}>{photo.caption}</p>
                  )}
                  <p style={{ fontSize: '11px', color: 'var(--cs-text-3)', margin: 0 }}>{fmt(photo.created_at)}</p>
                </div>
              ))}
            </div>
          </FadeInItem>
        )}

        {/* Completion photos */}
        {completionPhotos.length > 0 && (
          <FadeInItem index={2} className="cs-card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--cs-text-1)', margin: '0 0 16px' }}>
              Reinigungsfotos ({completionPhotos.length})
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {completionPhotos.map(photo => (
                <div key={photo.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {photo.url ? (
                    <a href={photo.url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={photo.url}
                        alt="Reinigung"
                        style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--cs-radius-md)', border: '1px solid var(--cs-border)', opacity: 1, transition: 'opacity 0.15s' }}
                        onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
                        onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                      />
                    </a>
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '1', background: 'var(--cs-surface-2)', borderRadius: 'var(--cs-radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--cs-text-3)' }}>
                      Nicht verfügbar
                    </div>
                  )}
                  <p style={{ fontSize: '11px', color: 'var(--cs-text-3)', margin: 0 }}>{fmt(photo.created_at)}</p>
                </div>
              ))}
            </div>
          </FadeInItem>
        )}

        {/* No photos */}
        {photosWithUrls.length === 0 && (
          <FadeInItem index={1} className="cs-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--cs-text-3)', margin: 0 }}>Noch keine Fotos für diesen Auftrag</p>
          </FadeInItem>
        )}

      </main>
    </div>
  )
}
