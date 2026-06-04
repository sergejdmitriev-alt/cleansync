'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RestoreButton({ taskId }: { taskId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleRestore() {
    setLoading(true)
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived: false }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleRestore}
      disabled={loading}
      className="cs-btn-secondary"
      style={{ fontSize: '12px', padding: '6px 12px', whiteSpace: 'nowrap' }}
    >
      {loading ? '…' : '♻️ Wiederherstellen'}
    </button>
  )
}
