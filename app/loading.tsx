import Header from './components/Header'
import { SkeletonHeute, SkeletonStatTile, SkeletonTaskCard } from '@/components/motion/Skeleton'

export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <Header />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>
        {/* Greeting placeholder */}
        <div className="cs-skeleton hidden md:block" style={{ width: 160, height: 22, borderRadius: 4, marginBottom: 20 }} />

        {/* Heute widget */}
        <div style={{ marginBottom: 16 }}>
          <SkeletonHeute />
        </div>

        <div className="dashboard-grid">
          <div>
            {/* Stats tiles */}
            <div className="cs-stats-grid">
              {[0, 1, 2, 3, 4].map(i => <SkeletonStatTile key={i} />)}
            </div>

            {/* Task list */}
            <div className="cs-card" style={{ overflow: 'hidden' }}>
              {/* Toolbar placeholder */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--cs-border)', display: 'flex', justifyContent: 'space-between' }}>
                <div className="cs-skeleton" style={{ width: 80, height: 15, borderRadius: 4 }} />
                <div className="cs-skeleton" style={{ width: 64, height: 28, borderRadius: 8 }} />
              </div>
              {/* Filter pills placeholder */}
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--cs-border)', display: 'flex', gap: 6 }}>
                {[60, 90, 72, 80, 68].map((w, i) => (
                  <div key={i} className="cs-skeleton" style={{ width: w, height: 28, borderRadius: 999 }} />
                ))}
              </div>
              {[0, 1, 2, 3, 4, 5].map(i => <SkeletonTaskCard key={i} />)}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
