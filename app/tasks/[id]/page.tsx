import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/components/Header'

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:  { label: 'Ausstehend',  className: 'bg-gray-100 text-gray-600' },
  sent:     { label: 'Gesendet',    className: 'bg-blue-100 text-blue-700' },
  accepted: { label: 'Angenommen',  className: 'bg-green-100 text-green-700' },
  declined: { label: 'Abgelehnt',   className: 'bg-red-100 text-red-700' },
  done:     { label: 'Erledigt',    className: 'bg-emerald-100 text-emerald-700' },
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Назад */}
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700">
          ← Zurück zur Übersicht
        </Link>

        {/* Детали задачи */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {task.properties?.name ?? '—'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">{task.properties?.address}</p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${s.className}`}>
              {s.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-1">Reinigungskraft</p>
              <p className="font-medium">
                {task.send_to_agency ? '🧹 Reinraum' : (task.cleaners?.name ?? '—')}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Abreise</p>
              <p className="font-medium">{fmt(task.checkout_time)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Anreise</p>
              <p className="font-medium">{fmt(task.checkin_time)}</p>
            </div>
            {task.done_at && (
              <div>
                <p className="text-gray-400 text-xs mb-1">Abgeschlossen</p>
                <p className="font-medium">{fmt(task.done_at)}</p>
              </div>
            )}
            {task.notes && (
              <div className="col-span-2">
                <p className="text-gray-400 text-xs mb-1">Notizen</p>
                <p className="font-medium">{task.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Фото проблем */}
        {problemPhotos.length > 0 && (
          <div className="bg-white rounded-xl border border-red-100 p-6 space-y-4">
            <h2 className="font-semibold text-red-600">⚠️ Gemeldete Probleme ({problemPhotos.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {problemPhotos.map(photo => (
                <div key={photo.id} className="space-y-1">
                  {photo.url ? (
                    <a href={photo.url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={photo.url}
                        alt="Problem"
                        className="w-full aspect-square object-cover rounded-lg border border-red-100 hover:opacity-90 transition-opacity"
                      />
                    </a>
                  ) : (
                    <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                      Nicht verfügbar
                    </div>
                  )}
                  {photo.caption && (
                    <p className="text-xs text-gray-500">{photo.caption}</p>
                  )}
                  <p className="text-xs text-gray-300">{fmt(photo.created_at)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Фото уборки */}
        {completionPhotos.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">📸 Reinigungsfotos ({completionPhotos.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {completionPhotos.map(photo => (
                <div key={photo.id} className="space-y-1">
                  {photo.url ? (
                    <a href={photo.url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={photo.url}
                        alt="Reinigung"
                        className="w-full aspect-square object-cover rounded-lg border border-gray-100 hover:opacity-90 transition-opacity"
                      />
                    </a>
                  ) : (
                    <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                      Nicht verfügbar
                    </div>
                  )}
                  <p className="text-xs text-gray-300">{fmt(photo.created_at)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Нет фото */}
        {photosWithUrls.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400">
            <p className="text-3xl mb-2">📷</p>
            <p className="text-sm">Noch keine Fotos für diesen Auftrag</p>
          </div>
        )}

      </main>
    </div>
  )
}
