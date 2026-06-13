'use client'
import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { CountUp } from '@/components/motion/CountUp'
import { FadeInItem } from '@/components/motion/FadeInItem'

function CountUpView({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  return <span ref={ref}><CountUp value={inView ? value : 0} /></span>
}

type Props = {
  total:       number
  acceptedPct: number
  declined:    number
  avgMin:      number | null
}

export function StatistikMetrics({ total, acceptedPct, declined, avgMin }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
      {([
        { label: 'Aufträge gesamt', content: <CountUpView value={total} />,                                             color: 'var(--cs-text-1)' },
        { label: 'Akzeptiert',      content: <><CountUpView value={acceptedPct} />%</>,                                  color: '#2563eb'          },
        { label: 'Abgelehnt',       content: <CountUpView value={declined} />,                                           color: 'var(--cs-danger)' },
        { label: 'Ø Antwortzeit',   content: avgMin !== null ? <><CountUpView value={avgMin} /> min</> : <>—</>,         color: '#059669'          },
      ] as const).map((s, i) => (
        <FadeInItem key={s.label} index={i} className="cs-card" style={{ padding: '16px 20px' }}>
          <p style={{ fontSize: '11px', color: 'var(--cs-text-3)', margin: '0 0 6px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {s.label}
          </p>
          <p style={{ fontSize: '30px', fontWeight: '700', color: s.color, margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>
            {s.content}
          </p>
        </FadeInItem>
      ))}
    </div>
  )
}
