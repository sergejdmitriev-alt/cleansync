'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Cleaner  { id: string; name: string; telegram_chat_id: number }
interface Property { id: string; name: string; address: string; default_notes?: string | null }

export default function SettingsPage() {
  const [cleaners, setCleaners]       = useState<Cleaner[]>([])
  const [properties, setProperties]   = useState<Property[]>([])

  const [newCleaner, setNewCleaner]   = useState({ name: '', telegram_chat_id: '' })
  const [newProperty, setNewProperty] = useState({ name: '', address: '', default_notes: '' })

  const [editingCleaner, setEditingCleaner]   = useState<Cleaner | null>(null)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)

  async function load() {
    const [c, p] = await Promise.all([
      fetch('/api/cleaners').then(r => r.json()),
      fetch('/api/properties').then(r => r.json()),
    ])
    setCleaners(c)
    setProperties(p)
  }

  useEffect(() => { load() }, [])

  async function addCleaner() {
    await fetch('/api/cleaners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCleaner),
    })
    setNewCleaner({ name: '', telegram_chat_id: '' })
    load()
  }

  async function addProperty() {
    await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProperty),
    })
    setNewProperty({ name: '', address: '', default_notes: '' })
    load()
  }

  async function deleteCleaner(id: string) {
    if (!confirm('Reinigungskraft löschen?')) return
    await fetch(`/api/cleaners/${id}`, { method: 'DELETE' })
    load()
  }

  async function deleteProperty(id: string) {
    if (!confirm('Objekt löschen?')) return
    await fetch(`/api/properties/${id}`, { method: 'DELETE' })
    load()
  }

  async function saveCleaner() {
    if (!editingCleaner) return
    await fetch(`/api/cleaners/${editingCleaner.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingCleaner),
    })
    setEditingCleaner(null)
    load()
  }

  async function saveProperty() {
    if (!editingProperty) return
    await fetch(`/api/properties/${editingProperty.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingProperty),
    })
    setEditingProperty(null)
    load()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700">← Zurück</Link>
          <h1 className="text-2xl font-bold">⚙️ Einstellungen</h1>
        </div>

        {/* Objekte */}
        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">🏠 Objekte</h2>
          <div className="space-y-3">
            {properties.map(p => (
              <div key={p.id} className="border border-gray-100 rounded-lg p-3">
                {editingProperty?.id === p.id ? (
                  <div className="space-y-2">
                    <input
                      className="border rounded px-2 py-1 w-full text-sm"
                      placeholder="Name"
                      value={editingProperty.name}
                      onChange={e => setEditingProperty({ ...editingProperty, name: e.target.value })}
                    />
                    <input
                      className="border rounded px-2 py-1 w-full text-sm"
                      placeholder="Adresse"
                      value={editingProperty.address}
                      onChange={e => setEditingProperty({ ...editingProperty, address: e.target.value })}
                    />
                    <textarea
                      className="border rounded px-2 py-1 w-full text-sm resize-none"
                      placeholder="Notizvorlage (optional) — z. B. Handtücher wechseln, Kühlschrank reinigen..."
                      rows={2}
                      value={editingProperty.default_notes ?? ''}
                      onChange={e => setEditingProperty({ ...editingProperty, default_notes: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <button onClick={saveProperty} className="text-sm bg-blue-600 text-white px-3 py-1 rounded">Speichern</button>
                      <button onClick={() => setEditingProperty(null)} className="text-sm text-gray-500">Abbrechen</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.address}</div>
                      {p.default_notes && (
                        <div className="text-xs text-gray-400 mt-1 italic">📋 {p.default_notes}</div>
                      )}
                    </div>
                    <button onClick={() => setEditingProperty(p)} className="text-sm text-blue-600 shrink-0">Bearbeiten</button>
                    <button onClick={() => deleteProperty(p.id)} className="text-sm text-red-500 shrink-0">Löschen</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="text-sm font-medium text-gray-600">Neues Objekt</div>
            <input
              className="border rounded px-3 py-2 w-full text-sm"
              placeholder="Name"
              value={newProperty.name}
              onChange={e => setNewProperty({ ...newProperty, name: e.target.value })}
            />
            <input
              className="border rounded px-3 py-2 w-full text-sm"
              placeholder="Adresse"
              value={newProperty.address}
              onChange={e => setNewProperty({ ...newProperty, address: e.target.value })}
            />
            <textarea
              className="border rounded px-3 py-2 w-full text-sm resize-none"
              placeholder="Notizvorlage (optional) — z. B. Handtücher wechseln..."
              rows={2}
              value={newProperty.default_notes}
              onChange={e => setNewProperty({ ...newProperty, default_notes: e.target.value })}
            />
            <button onClick={addProperty} className="bg-blue-600 text-white text-sm px-4 py-2 rounded w-full">
              + Hinzufügen
            </button>
          </div>
        </section>

        {/* Reinigungskräfte */}
        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">🧹 Reinigungskräfte</h2>
          <div className="space-y-2">
            {cleaners.map(c => (
              <div key={c.id} className="flex items-center gap-2">
                {editingCleaner?.id === c.id ? (
                  <>
                    <input className="border rounded px-2 py-1 flex-1 text-sm" value={editingCleaner.name}
                      onChange={e => setEditingCleaner({ ...editingCleaner, name: e.target.value })} />
                    <input className="border rounded px-2 py-1 flex-1 text-sm" value={String(editingCleaner.telegram_chat_id)}
                      onChange={e => setEditingCleaner({ ...editingCleaner, telegram_chat_id: Number(e.target.value) })} />
                    <button onClick={saveCleaner} className="text-sm bg-blue-600 text-white px-3 py-1 rounded">Speichern</button>
                    <button onClick={() => setEditingCleaner(null)} className="text-sm text-gray-500">Abbrechen</button>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{c.name}</div>
                      <div className="text-xs text-gray-500">Chat ID: {c.telegram_chat_id}</div>
                    </div>
                    <button onClick={() => setEditingCleaner(c)} className="text-sm text-blue-600">Bearbeiten</button>
                    <button onClick={() => deleteCleaner(c.id)} className="text-sm text-red-500">Löschen</button>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-2">
            <div className="text-sm font-medium text-gray-600">Neue Reinigungskraft</div>
            <input className="border rounded px-3 py-2 w-full text-sm" placeholder="Name"
              value={newCleaner.name} onChange={e => setNewCleaner({ ...newCleaner, name: e.target.value })} />
            <input className="border rounded px-3 py-2 w-full text-sm" placeholder="Telegram Chat ID"
              value={newCleaner.telegram_chat_id} onChange={e => setNewCleaner({ ...newCleaner, telegram_chat_id: e.target.value })} />
            <button onClick={addCleaner} className="bg-blue-600 text-white text-sm px-4 py-2 rounded w-full">
              + Hinzufügen
            </button>
          </div>
        </section>

      </div>
    </div>
  )
}
