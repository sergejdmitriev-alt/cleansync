'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/app/components/Header'

interface Cleaner  { id: string; name: string; telegram_chat_id: number }
interface Property { id: string; name: string; address: string; default_notes?: string | null; ical_url?: string | null }

const sectionStyle: React.CSSProperties = {
  marginBottom: '24px',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '13px',
  fontWeight: '500', color: 'var(--cs-text-2)', marginBottom: '6px',
}
const rowStyle: React.CSSProperties = {
  display: 'flex', gap: '8px', alignItems: 'center',
  padding: '12px 20px', borderBottom: '1px solid var(--cs-border)',
}

export default function SettingsPage() {
  const [cleaners,    setCleaners]    = useState<Cleaner[]>([])
  const [properties,  setProperties]  = useState<Property[]>([])
  const [newCleaner,  setNewCleaner]  = useState({ name: '', telegram_chat_id: '' })
  const [newProperty, setNewProperty] = useState({ name: '', address: '', default_notes: '', ical_url: '' })
  const [editingCleaner,  setEditingCleaner]  = useState<Cleaner | null>(null)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [telegramConnected, setTelegramConnected] = useState<boolean | null>(null)

  async function load() {
    const [c, p, t] = await Promise.all([
      fetch('/api/cleaners').then(r => r.json()),
      fetch('/api/properties').then(r => r.json()),
      fetch('/api/telegram/status').then(r => r.json()),
    ])
    setCleaners(c)
    setProperties(p)
    setTelegramConnected(t.connected ?? false)
  }
  useEffect(() => { load() }, [])

  async function addCleaner() {
    await fetch('/api/cleaners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newCleaner) })
    setNewCleaner({ name: '', telegram_chat_id: '' })
    load()
  }
  async function addProperty() {
    await fetch('/api/properties', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newProperty) })
    setNewProperty({ name: '', address: '', default_notes: '', ical_url: '' })
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
    await fetch(`/api/cleaners/${editingCleaner.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingCleaner) })
    setEditingCleaner(null)
    load()
  }
  async function syncProperty(id: string) {
    const res = await fetch('/api/sync/ical', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property_id: id }),
    })
    const { results } = await res.json()
    const r = results?.[0]
    if (r?.error) {
      alert(`Fehler: ${r.error}`)
    } else {
      alert(`Synchronisiert: ${r?.created ?? 0} neue Aufträge, ${r?.skipped ?? 0} übersprungen`)
      load()
    }
  }
  async function saveProperty() {
    if (!editingProperty) return
    await fetch(`/api/properties/${editingProperty.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingProperty) })
    setEditingProperty(null)
    load()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cs-bg)' }}>
      <Header />
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 20px' }}>

        <h1 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--cs-text-1)', margin: '0 0 24px', letterSpacing: '-0.02em' }}>
          Einstellungen
        </h1>

        {/* Objekte */}
        <div style={sectionStyle}>
          <div className="cs-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--cs-border)' }}>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>🏠 Objekte</h2>
            </div>

            {properties.map(p => (
              <div key={p.id}>
                {editingProperty?.id === p.id ? (
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--cs-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input className="cs-input" value={editingProperty.name} placeholder="Name"
                      onChange={e => setEditingProperty({ ...editingProperty, name: e.target.value })} />
                    <input className="cs-input" value={editingProperty.address} placeholder="Adresse"
                      onChange={e => setEditingProperty({ ...editingProperty, address: e.target.value })} />
                    <textarea className="cs-input" rows={2} style={{ resize: 'none' }}
                      placeholder="Notizvorlage (optional)"
                      value={editingProperty.default_notes ?? ''}
                      onChange={e => setEditingProperty({ ...editingProperty, default_notes: e.target.value })} />
                    <input
                      className="cs-input"
                      placeholder="Airbnb iCal URL (optional)"
                      value={editingProperty.ical_url ?? ''}
                      onChange={e => setEditingProperty({ ...editingProperty, ical_url: e.target.value })}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={saveProperty} className="cs-btn-primary" style={{ fontSize: '13px', padding: '7px 16px' }}>Speichern</button>
                      <button onClick={() => setEditingProperty(null)} className="cs-btn-secondary" style={{ fontSize: '13px', padding: '7px 16px' }}>Abbrechen</button>
                    </div>
                  </div>
                ) : (
                  <div style={rowStyle}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: '500', fontSize: '14px', margin: '0 0 2px', color: 'var(--cs-text-1)' }}>{p.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--cs-text-3)', margin: 0 }}>{p.address}</p>
                      {p.default_notes && (
                        <p style={{ fontSize: '11px', color: 'var(--cs-text-3)', margin: '4px 0 0', fontStyle: 'italic' }}>
                          📋 {p.default_notes}
                        </p>
                      )}
                    </div>
                    {p.ical_url && (
                      <button
                        onClick={() => syncProperty(p.id)}
                        className="cs-btn-secondary"
                        style={{ fontSize: '12px', padding: '5px 10px' }}
                      >
                        🔄 Sync
                      </button>
                    )}
                    <button onClick={() => setEditingProperty(p)} className="cs-btn-secondary" style={{ fontSize: '12px', padding: '5px 12px' }}>Bearbeiten</button>
                    <button onClick={() => deleteProperty(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cs-text-3)', fontSize: '16px', padding: '4px' }}>🗑</button>
                  </div>
                )}
              </div>
            ))}

            {/* Neues Objekt */}
            <div style={{ padding: '16px 20px', background: 'var(--cs-surface-2)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cs-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                Neues Objekt
              </p>
              <input className="cs-input" placeholder="Name"
                value={newProperty.name} onChange={e => setNewProperty({ ...newProperty, name: e.target.value })} />
              <input className="cs-input" placeholder="Adresse"
                value={newProperty.address} onChange={e => setNewProperty({ ...newProperty, address: e.target.value })} />
              <textarea className="cs-input" rows={2} style={{ resize: 'none' }}
                placeholder="Notizvorlage (optional)"
                value={newProperty.default_notes}
                onChange={e => setNewProperty({ ...newProperty, default_notes: e.target.value })} />
              <input
                className="cs-input"
                placeholder="Airbnb iCal URL (optional)"
                value={newProperty.ical_url}
                onChange={e => setNewProperty({ ...newProperty, ical_url: e.target.value })}
              />
              <button onClick={addProperty} className="cs-btn-primary" style={{ alignSelf: 'flex-start', fontSize: '13px' }}>
                + Hinzufügen
              </button>
            </div>
          </div>
        </div>

        {/* Reinigungskräfte */}
        <div style={sectionStyle}>
          <div className="cs-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--cs-border)' }}>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>🧹 Reinigungskräfte</h2>
            </div>

            {cleaners.map(c => (
              <div key={c.id}>
                {editingCleaner?.id === c.id ? (
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--cs-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input className="cs-input" value={editingCleaner.name} placeholder="Name"
                      onChange={e => setEditingCleaner({ ...editingCleaner, name: e.target.value })} />
                    <input className="cs-input" value={String(editingCleaner.telegram_chat_id)} placeholder="Telegram Chat ID"
                      onChange={e => setEditingCleaner({ ...editingCleaner, telegram_chat_id: Number(e.target.value) })} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={saveCleaner} className="cs-btn-primary" style={{ fontSize: '13px', padding: '7px 16px' }}>Speichern</button>
                      <button onClick={() => setEditingCleaner(null)} className="cs-btn-secondary" style={{ fontSize: '13px', padding: '7px 16px' }}>Abbrechen</button>
                    </div>
                  </div>
                ) : (
                  <div style={rowStyle}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '500', fontSize: '14px', margin: '0 0 2px', color: 'var(--cs-text-1)' }}>{c.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--cs-text-3)', margin: 0 }}>Chat ID: {c.telegram_chat_id}</p>
                    </div>
                    <button onClick={() => setEditingCleaner(c)} className="cs-btn-secondary" style={{ fontSize: '12px', padding: '5px 12px' }}>Bearbeiten</button>
                    <button onClick={() => deleteCleaner(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cs-text-3)', fontSize: '16px', padding: '4px' }}>🗑</button>
                  </div>
                )}
              </div>
            ))}

            {/* Neue Reinigungskraft */}
            <div style={{ padding: '16px 20px', background: 'var(--cs-surface-2)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cs-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                Neue Reinigungskraft
              </p>
              <input className="cs-input" placeholder="Name"
                value={newCleaner.name} onChange={e => setNewCleaner({ ...newCleaner, name: e.target.value })} />
              <input className="cs-input" placeholder="Telegram Chat ID"
                value={newCleaner.telegram_chat_id} onChange={e => setNewCleaner({ ...newCleaner, telegram_chat_id: e.target.value })} />
              <button onClick={addCleaner} className="cs-btn-primary" style={{ alignSelf: 'flex-start', fontSize: '13px' }}>
                + Hinzufügen
              </button>
            </div>
          </div>
        </div>

        {/* Telegram-Benachrichtigungen */}
        <div style={sectionStyle}>
          <div className="cs-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--cs-border)' }}>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>💬 Telegram-Benachrichtigungen</h2>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {telegramConnected === null ? (
                  <span style={{ fontSize: '13px', color: 'var(--cs-text-3)' }}>Wird geladen…</span>
                ) : telegramConnected ? (
                  <>
                    <span style={{
                      display:      'inline-flex',
                      alignItems:   'center',
                      gap:          '5px',
                      padding:      '3px 10px',
                      borderRadius: 'var(--cs-radius-full)',
                      background:   'rgba(21,128,61,0.18)',
                      color:        '#86efac',
                      fontSize:     '12px',
                      fontWeight:   '500',
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#86efac', display: 'inline-block' }} />
                      Verbunden
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--cs-text-3)' }}>
                      Sie erhalten Benachrichtigungen in Telegram.
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: '13px', color: 'var(--cs-text-2)' }}>
                    Nicht verbunden
                  </span>
                )}
              </div>
              <div>
                <Link
                  href="/connect-telegram"
                  className={telegramConnected ? 'cs-btn-secondary' : 'cs-btn-primary'}
                  style={{ textDecoration: 'none', display: 'inline-flex', fontSize: '13px' }}
                >
                  {telegramConnected ? 'Erneut verbinden' : 'Verbinden'}
                </Link>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
