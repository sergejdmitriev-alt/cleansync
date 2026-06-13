'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RefreshButton, SendButton, DeleteButton, ArchiveButton } from './TaskActions'
import TaskCard from './TaskCard'
import ExportButton from './ExportButton'
import { FadeInItem } from '@/components/motion/FadeInItem'
import { EmptyState, HouseIcon, SearchEmptyIcon } from '@/components/EmptyState'

const STATUS_LABEL: Record<string, string> = {
  pending:            'Ausstehend',
  sent:               'Gesendet',
  accepted:           'Angenommen',
  declined:           'Abgelehnt',
  done:               'Erledigt',
  reinraum_pending:   'Reinraum – Anfrage',
  reinraum_confirmed: 'Reinraum – Bestätigt ✨',
  reinraum_declined:  'Reinraum – Abgelehnt',
}

const STATUS_BADGE: Record<string, string> = {
  pending:            'cs-badge cs-badge-pending',
  sent:               'cs-badge cs-badge-sent',
  accepted:           'cs-badge cs-badge-accepted',
  declined:           'cs-badge cs-badge-declined',
  done:               'cs-badge cs-badge-done',
  reinraum_pending:   'cs-badge cs-badge-reinraum-pending',
  reinraum_confirmed: 'cs-badge',
  reinraum_declined:  'cs-badge',
}

const REINRAUM_BADGE_STYLE: Record<string, React.CSSProperties> = {
  reinraum_pending:   { background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' },
  reinraum_confirmed: { background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' },
  reinraum_declined:  { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' },
}

const FILTERS = [
  { key: 'all',       label: 'Alle'        },
  { key: 'pending',   label: 'Ausstehend'  },
  { key: 'sent',      label: 'Gesendet'    },
  { key: 'accepted',  label: 'Angenommen'  },
  { key: 'declined',  label: 'Abgelehnt'   },
  { key: 'done',      label: 'Erledigt'    },
  { key: 'reinraum',  label: 'Reinraum' },
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
    : filter === 'reinraum'
    ? tasks.filter(t => t.send_to_agency)
    : tasks.filter(t => t.status === filter)

  return (
    <div className="cs-card" style={{ overflow: 'hidden' }}>

      {/* Toolbar */}
      <div style={{
        padding:        '14px 20px',
        borderBottom:   '1px solid var(--cs-border)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        gap:            '12px',
        flexWrap:       'wrap',
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
            : f.key === 'reinraum'
            ? tasks.filter(t => t.send_to_agency).length
            : tasks.filter(t => t.status === f.key).length
          if (count === 0 && f.key !== 'all' && filter !== f.key) return null
          const isReinraumPill = f.key === 'reinraum'
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={filter === f.key ? 'cs-pill cs-pill-active' : 'cs-pill'}
              style={isReinraumPill && filter !== f.key && count > 0
                ? { borderColor: '#d97706', color: '#92400e' }
                : undefined
              }
            >
              {f.label}{count > 0 ? ` (${count})` : ''}
            </button>
          )
        })}
      </div>

      {/* Пусто — нет задач вообще */}
      {tasks.length === 0 && (
        <EmptyState
          icon={<HouseIcon />}
          title="Noch keine Aufträge"
          subtitle="Erstellen Sie Ihren ersten Auftrag"
          action={
            <Link href="/tasks/new" style={{ fontSize: '13px', color: 'var(--cs-blue)', textDecoration: 'none', fontWeight: '500' }}>
              Auftrag erstellen →
            </Link>
          }
        />
      )}

      {/* Пусто — фильтр не дал результатов */}
      {tasks.length > 0 && filtered.length === 0 && (
        <EmptyState
          icon={<SearchEmptyIcon />}
          title="Keine Aufträge mit diesem Status"
        />
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
                  const hasProb    = (task._photos?.problem ?? 0) > 0
                  const isReinraum = task.send_to_agency

                  const borderColor = hasProb
                    ? 'var(--cs-danger)'
                    : isReinraum
                    ? '#d97706'
                    : 'transparent'

                  return (
                    <tr
                      key={task.id}
                      style={{
                        borderBottom: '1px solid var(--cs-border)',
                        borderLeft:   `3px solid ${borderColor}`,
                        background:   isReinraum ? 'rgba(251,191,36,0.04)' : 'transparent',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = isReinraum
                        ? 'rgba(251,191,36,0.09)'
                        : 'var(--cs-surface-2)'
                      )}
                      onMouseLeave={e => (e.currentTarget.style.background = isReinraum
                        ? 'rgba(251,191,36,0.04)'
                        : 'transparent'
                      )}
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
                        {isReinraum
                          ? <span style={{ fontWeight: '600', color: '#d97706' }}>Reinraum</span>
                          : task.cleaners?.name
                        }
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--cs-text-2)', whiteSpace: 'nowrap' }}>
                        {fmt(task.checkout_time)}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--cs-text-2)', whiteSpace: 'nowrap' }}>
                        {fmt(task.checkin_time)}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                          <span
                            className={STATUS_BADGE[task.status] ?? 'cs-badge cs-badge-pending'}
                            style={REINRAUM_BADGE_STYLE[task.status]}
                          >
                            {STATUS_LABEL[task.status] ?? task.status}
                          </span>
                          {task.escalated_at && (
                            <span style={{
                              fontSize: '10px', fontWeight: '600',
                              padding: '2px 7px', borderRadius: 'var(--cs-radius-full)',
                              background: 'rgba(245,158,11,0.15)', color: '#fbbf24',
                              border: '1px solid rgba(245,158,11,0.3)',
                            }}>
                              🛡️ Backup
                            </span>
                          )}
                        </div>
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
            {filtered.map((task, i) => (
              <FadeInItem key={task.id} index={i}>
                <TaskCard task={task} />
              </FadeInItem>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
