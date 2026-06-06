'use client'

export function RefreshButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="text-sm text-gray-400 hover:text-gray-600"
    >
      Aktualisieren
    </button>
  )
}

export function SendButton({ taskId, status }: { taskId: string; status: string }) {
  if (status === 'done' || status === 'cancelled') return null

  const label =
    status === 'pending'  ? 'Senden' :
    status === 'declined' ? 'Erneut senden' : null

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
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14H6L5 6"/>
        <path d="M10 11v6"/><path d="M14 11v6"/>
        <path d="M9 6V4h6v2"/>
      </svg>
    </button>
  )
}

export function ArchiveButton({ taskId }: { taskId: string }) {
  const handleArchive = async () => {
    if (!confirm('Auftrag archivieren?')) return
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived: true }),
    })
    window.location.reload()
  }

  return (
    <button
      onClick={handleArchive}
      className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1.5"
      title="Archivieren"
    >
      Archiv
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
