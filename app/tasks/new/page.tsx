'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Property = { id: string; name: string }
type Cleaner  = { id: string; name: string }

export default function NewTaskPage() {
  const router = useRouter()

  const [properties, setProperties] = useState<Property[]>([])
  const [cleaners, setCleaners]     = useState<Cleaner[]>([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const [form, setForm] = useState({
    property_id:   '',
    cleaner_id:    '',
    checkout_time: '',
    checkin_time:  '',
    notes:         '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  useEffect(() => {
    fetch('/api/properties').then(r => r.json()).then(setProperties)
    fetch('/api/cleaners').then(r => r.json()).then(setCleaners)
  }, [])

  async function handleSubmit(e: React.MouseEvent, sendNow: boolean) {
    e.preventDefault()

    if (!form.property_id || !form.cleaner_id || !form.checkout_time || !form.checkin_time) {
      setError('Bitte alle Pflichtfelder ausfüllen.')
      return
    }
    if (new Date(form.checkin_time) <= new Date(form.checkout_time)) {
      setError('Anreise muss nach der Abreise liegen.')
      return
    }

    setLoading(true)

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const task = await res.json()
    if (!res.ok) { setError(task.error); setLoading(false); return }

    if (sendNow) {
      await fetch(`/api/tasks/${task.id}/send`, { method: 'POST' })
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Zurück
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧹</span>
          <span className="text-xl font-bold text-gray-900">CleanSync</span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Neuer Auftrag</h1>

        <form className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objekt <span className="text-red-500">*</span>
            </label>
            <select
              value={form.property_id}
              onChange={e => set('property_id', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">— Objekt auswählen —</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reinigungskraft <span className="text-red-500">*</span>
            </label>
            <select
              value={form.cleaner_id}
              onChange={e => set('cleaner_id', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">— Reinigungskraft auswählen —</option>
              {cleaners.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Abreise der Gäste <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={form.checkout_time}
              onChange={e => set('checkout_time', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anreise der nächsten Gäste <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={form.checkin_time}
              onChange={e => set('checkin_time', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notizen <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={3}
              placeholder="z. B. Handtücher wechseln, Kühlschrank reinigen..."
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              onClick={(e) => handleSubmit(e, false)}
              className="w-full sm:flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Wird gespeichert...' : 'Speichern'}
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={(e) => handleSubmit(e, true)}
              className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Wird gesendet...' : '📤 Speichern & Senden'}
            </button>
          </div>

        </form>
      </main>
    </div>
  )
}
