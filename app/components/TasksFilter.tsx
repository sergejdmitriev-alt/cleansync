'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RefreshButton, SendButton, DeleteButton, ArchiveButton } from './TaskActions'
import TaskCard from './TaskCard'

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:  { label: 'Ausstehend',  className: 'bg-gray-100 text-gray-600' },
  sent:     { label: 'Gesendet',    className: 'bg-blue-100 text-blue-700' },
  accepted: { label: 'Angenommen',  className: 'bg-green-100 text-green-700' },
  declined: { label: 'Abgelehnt',   className: 'bg-red-100 text-red-700' },
  done:     { label: 'Erledigt',    className: 'bg-emerald-100 text-emerald-700' },
}

const FILTERS = [
  { key: 'all',      label: 'Alle' },
  { key: 'pending',  label: 'Ausstehend' },
  { key: 'sent',     label: 'Gesendet' },
  { key: 'accepted', label: 'Angenommen' },
  { key: 'declined', label: 'Abgelehnt' },
  { key: 'done',     label: 'Erledigt' },
]

function fmt(dt: string) {
  return new Date(dt).toLocaleString('de-AT', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function TasksFilter({ tasks }: { tasks: any[] }) {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all'
    ? tasks
    : tasks.filter(t => t.status === filter)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

      {/* Заголовок */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Aufträge</h2>
        <RefreshButton />
      </div>

      {/* Фильтр-кнопки */}
      <div className="px-4 sm:px-6 py-3 border-b border-gray-100 flex gap-2 flex-wrap">
        {FILTERS.map(f => {
          const count = f.key === 'all'
            ? tasks.length
            : tasks.filter(t => t.status === f.key).length
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                ${filter === f.key
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {f.label} {count > 0 && <span className="opacity-60">({count})</span>}
            </button>
          )
        })}
      </div>

      {/* Пустое состояние — нет задач вообще */}
      {tasks.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-lg font-medium">Noch keine Aufträge</p>
          <Link href="/tasks/new" className="text-blue-500 text-sm mt-2 inline-block">
            Ersten Auftrag erstellen →
          </Link>
        </div>
      )}

      {/* Пустое состояние — нет задач по фильтру */}
      {tasks.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">Keine Aufträge mit diesem Status</p>
        </div>
      )}

      {/* Контент */}
      {filtered.length > 0 && (
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
                {filtered.map((task) => {
                  const s = statusConfig[task.status] ?? statusConfig.pending
                  return (
                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/tasks/${task.id}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors underline decoration-gray-300 underline-offset-2">
                          {task.properties?.name}
                        </Link>
                        <p className="text-xs text-gray-400 truncate max-w-[180px]">
                          {task.properties?.address}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {task._photos?.completion > 0 && (
                            <span className="text-xs text-gray-400">📷 {task._photos.completion}</span>
                          )}
                          {task._photos?.problem > 0 && (
                            <span className="text-xs text-red-500 font-medium">⚠️ Problem gemeldet</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{task.send_to_agency ? '🧹 Reinraum' : task.cleaners?.name}</td>
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
            {filtered.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
