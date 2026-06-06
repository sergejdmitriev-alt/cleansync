'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Property = { id: string; name: string; default_notes?: string | null }
type Cleaner  = { id: string; name: string }

export default function NewTaskPage() {
  const router = useRouter()

  const [properties, setProperties]     = useState<Property[]>([])
  const [cleaners, setCleaners]         = useState<Cleaner[]>([])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [sendToAgency, setSendToAgency] = useState(false)

  const [form, setForm] = useState({
    property_id: '', cleaner_id: '',
    checkout_time: '', checkin_time: '', notes: '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  useEffect(() => {
    fetch('/api/properties').then(r => r.json()).then(setProperties)
    fetch('/api/cleaners').then(r => r.json()).then(setCleaners)
    // Prefill checkout_time if ?date= is passed from calendar
    const dateParam = new URLSearchParams(window.location.search).get('date')
    if (dateParam) setForm(prev => ({ ...prev, checkout_time: `${dateParam}T11:00` }))
  }, [])

  async function handleSubmit(e: React.MouseEvent, sendNow: boolean) {
    e.preventDefault()
    if (!form.property_id || !form.checkout_time || !form.checkin_time) {
      setError('Bitte alle Pflichtfelder ausfüllen.')
      return
    }
    if (!sendToAgency && !form.cleaner_id) {
      setError('Bitte eine Reinigungskraft auswählen.')
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
      body: JSON.stringify({
        ...form,
        cleaner_id:     sendToAgency ? null : form.cleaner_id,
        send_to_agency: sendToAgency,
      }),
    })
    const task = await res.json()
    if (!res.ok) { setError(task.error); setLoading(false); return }
    if (sendNow) {
      await fetch(`/api/tasks/${task.id}/send`, { method: 'POST' })
    }
    router.push('/')
    router.refresh()
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px',
    fontWeight: '500', color: 'var(--cs-text-2)',
    marginBottom: '6px',
  }
  const req = <span style={{ color: 'var(--cs-danger)' }}>*</span>

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cs-bg)' }}>

      {/* Header */}
      <header style={{
        background: 'var(--cs-surface)',
        borderBottom: '1px solid var(--cs-border)',
        padding: '0 20px', height: '56px',
        display: 'flex', alignItems: 'center', gap: '16px',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <Link href="/" style={{ fontSize: '13px', color: 'var(--cs-text-3)', textDecoration: 'none' }}>
          ← Zurück
        </Link>
        <span style={{ fontWeight: '600', fontSize: '15px', letterSpacing: '-0.01em' }}>✦ CleanSync</span>
      </header>

      <main style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--cs-text-1)', margin: '0 0 24px', letterSpacing: '-0.02em' }}>
          Neuer Auftrag
        </h1>

        <div className="cs-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Objekt */}
            <div>
              <label style={labelStyle}>Objekt {req}</label>
              <select
                value={form.property_id}
                onChange={e => {
                  const id = e.target.value
                  set('property_id', id)
                  const selected = properties.find(p => p.id === id)
                  if (selected?.default_notes) set('notes', selected.default_notes)
                }}
                className="cs-input"
                style={{ appearance: 'auto' }}
              >
                <option value="">— Objekt auswählen —</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {/* Reinigungskraft */}
            <div>
              <label style={labelStyle}>Reinigungskraft {req}</label>
              <div style={{
                display: 'flex', borderRadius: 'var(--cs-radius-md)',
                border: '1px solid var(--cs-border)', overflow: 'hidden', marginBottom: '10px',
              }}>
                {[
                  { val: false, label: 'Eigene Reinigungskraft' },
                  { val: true,  label: 'Reinraum' },
                ].map(({ val, label }) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => { setSendToAgency(val); setError('') }}
                    style={{
                      flex: 1, padding: '9px 12px', border: 'none',
                      fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                      transition: 'all 0.12s',
                      background: sendToAgency === val ? 'var(--cs-text-1)' : 'var(--cs-surface)',
                      color:      sendToAgency === val ? 'var(--cs-surface)' : 'var(--cs-text-2)',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {!sendToAgency ? (
                <select
                  value={form.cleaner_id}
                  onChange={e => set('cleaner_id', e.target.value)}
                  className="cs-input"
                  style={{ appearance: 'auto' }}
                >
                  <option value="">— Reinigungskraft auswählen —</option>
                  {cleaners.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              ) : (
                <div style={{
                  background: 'var(--cs-blue-bg)', border: '1px solid #BFDBFE',
                  borderRadius: 'var(--cs-radius-md)', padding: '10px 14px',
                  fontSize: '13px', color: 'var(--cs-blue-text)',
                }}>
                  📋 Auftrag wird direkt an <strong>Reinraum</strong> weitergeleitet.
                </div>
              )}
            </div>

            {/* Abreise */}
            <div>
              <label style={labelStyle}>Abreise der Gäste {req}</label>
              <input
                type="datetime-local"
                value={form.checkout_time}
                onChange={e => set('checkout_time', e.target.value)}
                className="cs-input"
              />
            </div>

            {/* Anreise */}
            <div>
              <label style={labelStyle}>Anreise der nächsten Gäste {req}</label>
              <input
                type="datetime-local"
                value={form.checkin_time}
                onChange={e => set('checkin_time', e.target.value)}
                className="cs-input"
              />
            </div>

            {/* Notizen */}
            <div>
              <label style={labelStyle}>
                Notizen <span style={{ color: 'var(--cs-text-3)', fontWeight: '400' }}>(optional)</span>
              </label>
              <textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                rows={3}
                placeholder="z. B. Handtücher wechseln, Kühlschrank reinigen…"
                className="cs-input"
                style={{ resize: 'none' }}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'var(--cs-danger-bg)', border: '1px solid var(--cs-danger-border)',
                borderRadius: 'var(--cs-radius-md)', padding: '10px 14px',
                fontSize: '13px', color: 'var(--cs-danger-text)',
              }}>
                {error}
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
              <button
                type="button"
                disabled={loading}
                onClick={e => handleSubmit(e, false)}
                className="cs-btn-secondary"
                style={{ flex: 1, justifyContent: 'center', padding: '11px' }}
              >
                {loading ? 'Wird gespeichert…' : 'Speichern'}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={e => handleSubmit(e, true)}
                className="cs-btn-primary"
                style={{ flex: 1, justifyContent: 'center', padding: '11px', fontSize: '14px' }}
              >
                {loading ? 'Wird gesendet…' : '📤 Speichern & Senden'}
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
