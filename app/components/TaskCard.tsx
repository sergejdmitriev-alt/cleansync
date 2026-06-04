import Link from 'next/link'
import { SendButton, DeleteButton, ArchiveButton } from './TaskActions'

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

export default function TaskCard({ task }: { task: any }) {
  const s       = statusConfig[task.status] ?? statusConfig.pending
  const photos  = task._photos ?? { completion: 0, problem: 0 }
  const hasProb = photos.problem > 0

  return (
    <div className={`p-4 space-y-3 ${hasProb ? 'border-l-4 border-red-400' : ''}`}>

      {/* Проблема — баннер */}
      {hasProb && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 text-xs font-medium px-3 py-1.5 rounded-lg">
          <span>⚠️</span>
          <span>Problem gemeldet</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div>
          <Link
            href={`/tasks/${task.id}`}
            className="font-semibold text-gray-900 text-sm hover:text-blue-600 transition-colors underline decoration-gray-300 underline-offset-2"
          >
            {task.properties?.name}
          </Link>
          <p className="text-xs text-gray-400 mt-0.5">{task.properties?.address}</p>
        </div>
        <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.className}`}>
          {s.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div>
          <p className="text-gray-400 uppercase tracking-wide text-[10px]">Reinigungskraft</p>
          <p className="font-medium mt-0.5">
            {task.send_to_agency ? '🧹 Reinraum' : task.cleaners?.name}
          </p>
        </div>
        <div>
          <p className="text-gray-400 uppercase tracking-wide text-[10px]">Abreise</p>
          <p className="font-medium mt-0.5">{fmt(task.checkout_time)}</p>
        </div>
        <div>
          <p className="text-gray-400 uppercase tracking-wide text-[10px]">Anreise</p>
          <p className="font-medium mt-0.5">{fmt(task.checkin_time)}</p>
        </div>

        {/* Фото индикатор */}
        {(photos.completion > 0 || photos.problem > 0) && (
          <div>
            <p className="text-gray-400 uppercase tracking-wide text-[10px]">Fotos</p>
            <div className="flex items-center gap-2 mt-0.5">
              {photos.completion > 0 && (
                <span className="text-gray-500">📷 {photos.completion}</span>
              )}
              {photos.problem > 0 && (
                <span className="text-red-500">⚠️ {photos.problem}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Кнопка деталей */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SendButton taskId={task.id} status={task.status} />
          {task.status === 'done' && <ArchiveButton taskId={task.id} />}
          <DeleteButton taskId={task.id} />
        </div>
        <Link
          href={`/tasks/${task.id}`}
          className="text-xs text-blue-500 hover:text-blue-700 font-medium"
        >
          Details →
        </Link>
      </div>
    </div>
  )
}
