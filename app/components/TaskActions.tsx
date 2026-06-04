'use client'

export function RefreshButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="text-sm text-gray-400 hover:text-gray-600"
    >
      🔄 Aktualisieren
    </button>
  )
}

export function SendButton({ taskId, status }: { taskId: string; status: string }) {
  if (status === 'done' || status === 'cancelled') return null

  const label =
    status === 'pending'  ? '📤 Senden' :
    status === 'declined' ? '🔄 Erneut senden' : null

  if (!label) return <span className="text-xs text-gray-400">—</span>

  const handleSend = async () => {
    await fetch(`/api/tasks/${taskId}/send`, { method: 'POST' })
    window.location.reload()
  }

  return (
    <button
      onClick={handleSend}
      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium px-3 py-1.5 rounded-lg transition-colors"
    >
      {label}
    </button>
  )
}

export function DeleteButton({ taskId }: { taskId: string }) {
  const handleDelete = async () => {
    if (!confirm('Auftrag wirklich löschen?')) return
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    window.location.reload()
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1.5"
      title="Löschen"
    >
      🗑
    </button>
  )
}

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }
  return (
    <button
      onClick={handleLogout}
      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
    >
      Abmelden
    </button>
  )
}
