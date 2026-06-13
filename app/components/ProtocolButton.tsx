'use client'

import { useState } from 'react'

export function ProtocolButton({ taskId }: { taskId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/${taskId}/protocol`)
      if (!res.ok) throw new Error('PDF generation failed')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const cd   = res.headers.get('content-disposition') ?? ''
      const name = cd.match(/filename="([^"]+)"/)?.[1] ?? 'protokoll.pdf'
      const a    = document.createElement('a')
      a.href     = url
      a.download = name
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        gap:            '6px',
        padding:        '8px 14px',
        borderRadius:   'var(--cs-radius-md)',
        border:         '1px solid var(--cs-border)',
        background:     'var(--cs-surface-2)',
        color:          'var(--cs-text-2)',
        fontSize:       '13px',
        fontWeight:     '500',
        cursor:         loading ? 'default' : 'pointer',
        opacity:        loading ? 0.6 : 1,
        transition:     'opacity 150ms, background 150ms',
      }}
    >
      {loading ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'cs-spin 0.8s linear infinite', flexShrink: 0 }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          Wird erstellt…
        </>
      ) : (
        <>📄 Protokoll (PDF)</>
      )}
    </button>
  )
}
