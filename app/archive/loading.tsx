import Header from '@/app/components/Header'

export default function Loading() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>
        <div className="cs-skeleton" style={{ width: 60, height: 13, borderRadius: 4, marginBottom: 8 }} />
        <div className="cs-skeleton" style={{ width: 100, height: 22, borderRadius: 4, marginBottom: 20 }} />
        <div className="cs-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--cs-border)' }}>
            <div className="cs-skeleton" style={{ width: 160, height: 15, borderRadius: 4 }} />
          </div>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 16, padding: '14px 20px',
              borderBottom: i < 4 ? '1px solid var(--cs-border)' : 'none',
            }}>
              <div style={{ flex: 1 }}>
                <div className="cs-skeleton" style={{ width: 160, height: 14, borderRadius: 4, marginBottom: 6 }} />
                <div className="cs-skeleton" style={{ width: 120, height: 11, borderRadius: 4, marginBottom: 6 }} />
                <div className="cs-skeleton" style={{ width: 96, height: 11, borderRadius: 4 }} />
              </div>
              <div className="cs-skeleton" style={{ width: 72, height: 28, borderRadius: 8 }} />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
