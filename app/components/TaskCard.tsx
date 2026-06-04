import { SendButton } from './TaskActions'

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

interface Props {
  task: any
}

export default function TaskCard({ task }: Props) {
  const s = statusConfig[task.status] ?? statusConfig.pending

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{task.properties?.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{task.properties?.address}</p>
        </div>
        <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.className}`}>
          {s.label}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div>
          <p className="text-gray-400 uppercase tracking-wide text-[10px]">Reinigungskraft</p>
          <p className="font-medium mt-0.5">{task.cleaners?.name}</p>
        </div>
        <div>
          <p className="text-gray-400 uppercase tracking-wide text-[10px]">Abreise</p>
          <p className="font-medium mt-0.5">{fmt(task.checkout_time)}</p>
        </div>
        <div>
          <p className="text-gray-400 uppercase tracking-wide text-[10px]">Anreise</p>
          <p className="font-medium mt-0.5">{fmt(task.checkin_time)}</p>
        </div>
      </div>
      <SendButton taskId={task.id} status={task.status} />
    </div>
  )
}
