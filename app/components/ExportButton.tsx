'use client'

import { useState } from 'react'

export default function ExportButton() {
  const now    = new Date()
  const def    = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [month, setMonth] = useState(def)
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    const res = await fetch(`/api/export/pdf?month=${month}`)
    if (!res.ok) { setLoading(false); return }

    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `CleanSync_${month}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="month"
        value={month}
        onChange={e => setMonth(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleExport}
        disabled={loading}
        className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? 'Wird erstellt...' : '📄 PDF exportieren'}
      </button>
    </div>
  )
}
