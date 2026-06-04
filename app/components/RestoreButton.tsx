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
      className="text-sm px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
    >
      {loading ? '...' : '♻️ Wiederherstellen'}
    </button>
  )
}
