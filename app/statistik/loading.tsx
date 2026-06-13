import Header from '@/app/components/Header'
import { SkeletonStatTile } from '@/components/motion/Skeleton'

export default function Loading() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 20px 80px' }}>
        <div className="cs-skeleton" style={{ width: 120, height: 22, borderRadius: 4, marginBottom: 6 }} />
        <div className="cs-skeleton" style={{ width: 80, height: 13, borderRadius: 4, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
          {[0, 1, 2, 3].map(i => <SkeletonStatTile key={i} />)}
        </div>
        <div className="cs-card" style={{ height: 180, marginBottom: 24 }} />
        <div className="cs-card" style={{ height: 140 }} />
      </main>
    </div>
  )
}
