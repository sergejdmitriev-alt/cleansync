'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RefreshButton, SendButton, DeleteButton, ArchiveButton } from './TaskActions'
import TaskCard from './TaskCard'
import ExportButton from './ExportButton'

const STATUS_LABEL: Record<string, string> = {
  pending:  'Ausstehend',
  sent:     'Gesendet',
  accepted: 'Angenommen',
  declined: 'Abgelehnt',
  done:     'Erledigt',
}

const STATUS_BADGE: Record<string, string> = {
  pending:  'cs-badge cs-badge-pending',
  sent:     'cs-badge cs-badge-sent',
  accepted: 'cs-badge cs-badge-accepted',
  declined: 'cs-badge cs-badge-declined',
  done:     'cs-badge cs-badge-done',
}

const FILTERS = [
  { key: 'all',      label: 'Alle'      },
  { key: 'pending',  label: 'Ausstehend'},
  { key: 'sent',     label: 'Gesendet'  },
  { key: 'accepted', label: 'Angenommen'},
  { key: 'declined', label: 'Abgelehnt' },
  { key: 'done',     label: 'Erledigt'  },
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
    <div className="cs-card" style={{ overflow: 'hidden' }}>

      {/* Toolbar */}
      <div style={{
        padding:       '14px 20px',
        borderBottom:  '1px solid var(--cs-border)',
        display:       'flex',
        alignItems:    'center',
        justifyContent:'space-between',
        gap:           '12px',
        flexWrap:      'wrap',
      }}>
        <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--cs-text-1)' }}>
          Aufträge
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ExportButton />
          <RefreshButton />
        </div>
      </div>

      {/* Filter pills */}
      <div style={{
        padding:      '12px 20px',
        borderBottom: '1px solid var(--cs-border)',
        display:      'flex',
        gap:          '6px',
        flexWrap:     'wrap',
      }}>
        {FILTERS.map(f => {
          const count = f.key === 'all'
            ? tasks.length
            : tasks.filter(t => t.status === f.key).length
          if (count === 0 && f.key !== 'all' && filter !== f.key) return null
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={filter === f.key ? 'cs-pill cs-pill-active' : 'cs-pill'}
            >
              {f.label}{count > 0 ? ` (${count})` : ''}
            </button>
          )
        })}
      </div>

      {/* Пусто — нет задач вообще */}
      {tasks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 20px' }}>
          <p style={{ fontSize: '36px', margin: '0 0 12px' }}>📋</p>
          <p style={{ fontSize: '15px', fontWeight: '500', color: 'var(--cs-text-2)', margin: '0 0 8px' }}>
            Noch keine Aufträge
          </p>
          <Link href="/tasks/new" style={{ fontSize: '13px', color: 'var(--cs-blue)', textDecoration: 'none' }}>
            Ersten Auftrag erstellen →
          </Link>
        </div>
      )}

      {/* Пусто — фильтр не дал результатов */}
      {tasks.length > 0 && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--cs-text-3)' }}>
          <p style={{ fontSize: '13px', margin: 0 }}>Keine Aufträge mit diesem Status</p>
        </div>
      )}

      {filtered.length > 0 && (
        <>
          {/* Desktop таблица */}
          <div className="hidden sm:block" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--cs-surface-2)', borderBottom: '1px solid var(--cs-border)' }}>
                  {['Objekt', 'Reinigungskraft', 'Abreise', 'Anreise', 'Status', 'Aktion'].map(h => (
                    <th key={h} style={{
                      padding:       '10px 20px',
                      textAlign:     'left',
                      fontSize:      '11px',
                      fontWeight:    '500',
                      color:         'var(--cs-text-3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      whiteSpace:    'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(task => {
                  const hasProb = (task._photos?.problem ?? 0) > 0
                  return (
                    <tr
                      key={task.id}
                      style={{
                        borderBottom: '1px solid var(--cs-border)',
                        borderLeft:   hasProb
                          ? '3px solid var(--cs-danger)'
                          : '3px solid transparent',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--cs-surface-2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <Link
                          href={`/tasks/${task.id}`}
                          style={{ fontWeight: '500', color: 'var(--cs-text-1)', textDecoration: 'none' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--cs-blue)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--cs-text-1)')}
                        >
                          {task.properties?.name}
                        </Link>
                        <p style={{ fontSize: '11px', color: 'var(--cs-text-3)', margin: '2px 0 0', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {task.properties?.address}
                        </p>
                        {(hasProb || task._photos?.completion > 0) && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            {task._photos?.completion > 0 && (
                              <span style={{ fontSize: '11px', color: 'var(--cs-text-3)' }}>
                                📷 {task._photos.completion}
                              </span>
                            )}
                            {hasProb && (
                              <span style={{ fontSize: '11px', color: 'var(--cs-danger)', fontWeight: '500' }}>
                                ⚠️ Problem gemeldet
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--cs-text-2)' }}>
                        {task.send_to_agency ? '🧹 Reinraum' : task.cleaners?.name}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--cs-text-2)', whiteSpace: 'nowrap' }}>
                        {fmt(task.checkout_time)}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--cs-text-2)', whiteSpace: 'nowrap' }}>
                        {fmt(task.checkin_time)}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className={STATUS_BADGE[task.status] ?? 'cs-badge cs-badge-pending'}>
                          {STATUS_LABEL[task.status] ?? task.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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

          {/* Mobile карточки */}
          <div className="sm:hidden">
            {filtered.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
