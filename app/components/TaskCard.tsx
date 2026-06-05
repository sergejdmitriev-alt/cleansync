import Link from 'next/link'
import { SendButton, DeleteButton, ArchiveButton } from './TaskActions'

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
  reinraum_pending:   'cs-badge',
  reinraum_confirmed: 'cs-badge',
  reinraum_declined:  'cs-badge',
}

const REINRAUM_BADGE_STYLE: Record<string, React.CSSProperties> = {
  reinraum_pending:   { background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' },
  reinraum_confirmed: { background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' },
  reinraum_declined:  { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' },
}

function fmt(dt: string) {
  return new Date(dt).toLocaleString('de-AT', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function TaskCard({ task }: { task: any }) {
  const photos     = task._photos ?? { completion: 0, problem: 0 }
  const hasProb    = photos.problem > 0
  const isReinraum = task.send_to_agency

  const borderColor = hasProb
    ? 'var(--cs-danger)'
    : isReinraum
    ? '#d97706'
    : 'transparent'

  return (
    <div style={{
      borderBottom: '1px solid var(--cs-border)',
      borderLeft:   `3px solid ${borderColor}`,
      background:   isReinraum ? 'rgba(251,191,36,0.04)' : 'transparent',
      padding:      '14px 16px',
    }}>

      {hasProb && (
        <div style={{
          display:      'inline-flex',
          alignItems:   'center',
          gap:          '4px',
          background:   'var(--cs-danger-bg)',
          color:        'var(--cs-danger-text)',
          fontSize:     '11px',
          fontWeight:   '500',
          padding:      '3px 8px',
          borderRadius: 'var(--cs-radius-full)',
          marginBottom: '8px',
        }}>
          ⚠️ Problem gemeldet
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link href={`/tasks/${task.id}`} style={{
            fontWeight: '600', fontSize: '14px',
            color: 'var(--cs-text-1)', textDecoration: 'none',
            display: 'block',
          }}>
            {task.properties?.name}
          </Link>
          <p style={{ fontSize: '11px', color: 'var(--cs-text-3)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {task.properties?.address}
          </p>
        </div>
        <span
          className={STATUS_BADGE[task.status] ?? 'cs-badge cs-badge-pending'}
          style={REINRAUM_BADGE_STYLE[task.status]}
        >
          {STATUS_LABEL[task.status] ?? task.status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        <div>
          <p style={{ fontSize: '10px', color: 'var(--cs-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 2px', fontWeight: '500' }}>
            Reinigungskraft
          </p>
          <p style={{ fontSize: '13px', margin: 0, fontWeight: '500', color: isReinraum ? '#d97706' : 'var(--cs-text-1)' }}>
            {isReinraum ? '🧹 Reinraum' : task.cleaners?.name}
          </p>
        </div>
        <div>
          <p style={{ fontSize: '10px', color: 'var(--cs-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 2px', fontWeight: '500' }}>
            Abreise
          </p>
          <p style={{ fontSize: '13px', color: 'var(--cs-text-2)', margin: 0 }}>
            {fmt(task.checkout_time)}
          </p>
        </div>
        <div>
          <p style={{ fontSize: '10px', color: 'var(--cs-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 2px', fontWeight: '500' }}>
            Anreise
          </p>
          <p style={{ fontSize: '13px', color: 'var(--cs-text-2)', margin: 0 }}>
            {fmt(task.checkin_time)}
          </p>
        </div>
        {(photos.completion > 0 || hasProb) && (
          <div>
            <p style={{ fontSize: '10px', color: 'var(--cs-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 2px', fontWeight: '500' }}>
              Fotos
            </p>
            <p style={{ fontSize: '13px', color: 'var(--cs-text-2)', margin: 0 }}>
              {photos.completion > 0 && `📷 ${photos.completion}`}
              {hasProb && ` ⚠️ ${photos.problem}`}
            </p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <SendButton taskId={task.id} status={task.status} />
          {task.status === 'done' && <ArchiveButton taskId={task.id} />}
          <DeleteButton taskId={task.id} />
        </div>
        <Link href={`/tasks/${task.id}`} style={{
          fontSize: '12px', color: 'var(--cs-blue)',
          textDecoration: 'none', fontWeight: '500',
        }}>
          Details →
        </Link>
      </div>
    </div>
  )
}
