type Props = {
  width?:  string | number
  height?: string | number
  radius?: string | number
  style?:  React.CSSProperties
}

export function Skeleton({ width = '100%', height = 16, radius = 6, style }: Props) {
  return (
    <div
      className="cs-skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  )
}

export function SkeletonStatTile() {
  return (
    <div className="cs-card" style={{ padding: '16px 20px' }}>
      <Skeleton width={80} height={11} radius={4} style={{ marginBottom: 8 }} />
      <Skeleton width={52} height={34} radius={6} />
    </div>
  )
}

export function SkeletonTaskCard() {
  return (
    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--cs-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <Skeleton width={160} height={14} radius={4} style={{ marginBottom: 6 }} />
          <Skeleton width={120} height={11} radius={4} />
        </div>
        <Skeleton width={76} height={22} radius={999} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <Skeleton height={36} radius={6} />
        <Skeleton height={36} radius={6} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width={96} height={28} radius={8} />
        <Skeleton width={56} height={12} radius={4} />
      </div>
    </div>
  )
}

export function SkeletonHeute() {
  return (
    <div className="cs-card" style={{ padding: '16px 20px' }}>
      <Skeleton width={200} height={13} radius={4} style={{ marginBottom: 14 }} />
      <div style={{ display: 'flex', gap: 12 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ flex: 1, padding: '12px', background: 'var(--cs-surface-2)', borderRadius: 10 }}>
            <Skeleton width={40} height={28} radius={4} style={{ marginBottom: 6 }} />
            <Skeleton width="70%" height={10} radius={3} />
          </div>
        ))}
      </div>
    </div>
  )
}
