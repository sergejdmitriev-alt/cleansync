'use client'

import { useState } from 'react'

export default function ExportButton() {
  const now   = new Date()
  const def   = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [month, setMonth]     = useState(def)
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const res = await fetch(`/api/export/pdf?month=${month}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Fehler' }))
        alert(`PDF-Fehler: ${err.error}`)
        setLoading(false)
        return
      }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `CleanSync_${month}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Exportfehler – bitte erneut versuchen')
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <input
        type="month"
        value={month}
        onChange={e => setMonth(e.target.value)}
        className="cs-input"
        style={{ width: '140px', padding: '6px 10px', fontSize: '13px' }}
      />
      <button
        onClick={handleExport}
        disabled={loading}
        className="cs-btn-secondary"
        style={{ whiteSpace: 'nowrap', padding: '6px 12px' }}
      >
        {loading ? 'Wird erstellt…' : '📄 PDF'}
      </button>
    </div>
  )
}
