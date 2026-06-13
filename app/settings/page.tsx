'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/app/components/Header'
import { FadeInItem } from '@/components/motion/FadeInItem'
import { AnimatePresence, motion } from 'framer-motion'

interface Cleaner  { id: string; name: string; telegram_chat_id: number | null }
interface Property { id: string; name: string; address: string; default_notes?: string | null; ical_url?: string | null }
interface RecurringRule {
  id: string; property_id: string; cleaner_id: string | null
  frequency: 'weekly' | 'biweekly' | 'monthly'; weekday: number
  checkout_hour: number; notes: string | null; active: boolean
  cleaners: { id: string; name: string } | null
}

const FREQ_LABELS: Record<string, string> = { weekly: 'Wöchentlich', biweekly: 'Alle 2 Wochen', monthly: 'Alle 4 Wochen' }
const WEEKDAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

type RuleForm = { frequency: 'weekly' | 'biweekly' | 'monthly'; weekday: number; checkout_hour: number; cleaner_id: string; notes: string }
const EMPTY_RULE: RuleForm = { frequency: 'weekly', weekday: 0, checkout_hour: 11, cleaner_id: '', notes: '' }

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
  const [telegramConnected,  setTelegramConnected]  = useState<boolean | null>(null)
  const [autoBackup,         setAutoBackup]         = useState<boolean>(false)
  const [escalationHours,    setEscalationHours]    = useState<number>(4)
  const [expandedInvite,    setExpandedInvite]    = useState<string | null>(null)
  const [inviteLinks,       setInviteLinks]       = useState<Record<string, string>>({})
  const [copyDone,          setCopyDone]          = useState<string | null>(null)
  const [recurringRules,    setRecurringRules]    = useState<RecurringRule[]>([])
  const [expandedRecurring, setExpandedRecurring] = useState<string | null>(null)
  const [newRuleForms,      setNewRuleForms]      = useState<Record<string, RuleForm>>({})

  async function load() {
    const [c, p, t, b, r] = await Promise.all([
      fetch('/api/cleaners').then(r => r.json()),
      fetch('/api/properties').then(r => r.json()),
      fetch('/api/telegram/status').then(r => r.json()),
      fetch('/api/settings/backup').then(r => r.json()),
      fetch('/api/recurring').then(r => r.json()),
    ])
    setCleaners(c)
    setProperties(p)
    setTelegramConnected(t.connected ?? false)
    setAutoBackup(b.auto_backup_enabled ?? false)
    setEscalationHours(b.escalation_hours ?? 4)
    setRecurringRules(Array.isArray(r) ? r : [])
  }

  async function addRecurringRule(propertyId: string) {
    const form = newRuleForms[propertyId] ?? EMPTY_RULE
    const res = await fetch('/api/recurring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        property_id:   propertyId,
        cleaner_id:    form.cleaner_id || null,
        frequency:     form.frequency,
        weekday:       Number(form.weekday),
        checkout_hour: Number(form.checkout_hour),
        notes:         form.notes || null,
      }),
    })
    if (res.ok) {
      const rule = await res.json()
      setRecurringRules(prev => [...prev, rule])
      setNewRuleForms(prev => ({ ...prev, [propertyId]: EMPTY_RULE }))
      setExpandedRecurring(null)
    }
  }

  async function toggleRuleActive(rule: RecurringRule) {
    const res = await fetch(`/api/recurring/${rule.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !rule.active }),
    })
    if (res.ok) {
      const updated = await res.json()
      setRecurringRules(prev => prev.map(r => r.id === rule.id ? updated : r))
    }
  }

  async function deleteRecurringRule(id: string) {
    if (!confirm('Regel löschen?')) return
    await fetch(`/api/recurring/${id}`, { method: 'DELETE' })
    setRecurringRules(prev => prev.filter(r => r.id !== id))
  }

  async function saveBackup(enabled: boolean, hours: number) {
    await fetch('/api/settings/backup', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ auto_backup_enabled: enabled, escalation_hours: hours }),
    })
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
  async function createInvite(id: string) {
    const res = await fetch(`/api/cleaners/${id}/invite`, { method: 'POST' })
    const { deeplink } = await res.json()
    setInviteLinks(prev => ({ ...prev, [id]: deeplink }))
    setExpandedInvite(id)
    setCopyDone(null)
  }
  function copyInviteLink(id: string) {
    const link = inviteLinks[id]
    if (!link) return
    navigator.clipboard.writeText(link)
    setCopyDone(id)
    setTimeout(() => setCopyDone(c => c === id ? null : c), 1500)
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
        <FadeInItem index={0} style={sectionStyle}>
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
                  <>
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
                    <button
                      onClick={() => setExpandedRecurring(expandedRecurring === p.id ? null : p.id)}
                      className="cs-btn-secondary"
                      style={{ fontSize: '12px', padding: '5px 10px' }}
                      title="Wiederkehrende Reinigungen"
                    >
                      ↻ Regeln
                    </button>
                    <button onClick={() => setEditingProperty(p)} className="cs-btn-secondary" style={{ fontSize: '12px', padding: '5px 12px' }}>Bearbeiten</button>
                    <button onClick={() => deleteProperty(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cs-text-3)', fontSize: '16px', padding: '4px' }}>🗑</button>
                  </div>

                  {/* Recurring rules accordion */}
                  <AnimatePresence>
                    {expandedRecurring === p.id && (() => {
                      const rules   = recurringRules.filter(r => r.property_id === p.id)
                      const form    = newRuleForms[p.id] ?? EMPTY_RULE
                      const setForm = (upd: Partial<typeof EMPTY_RULE>) =>
                        setNewRuleForms(prev => ({ ...prev, [p.id]: { ...(prev[p.id] ?? EMPTY_RULE), ...upd } }))
                      return (
                        <motion.div
                          key="recurring"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          style={{ overflow: 'hidden', borderBottom: '1px solid var(--cs-border)', background: 'var(--cs-surface-2)' }}
                        >
                          <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--cs-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                              ↻ Wiederkehrende Reinigung
                            </p>

                            {/* Existing rules */}
                            {rules.map(rule => (
                              <div key={rule.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--cs-surface)', borderRadius: 'var(--cs-radius-md)', border: '1px solid var(--cs-border)' }}>
                                <div style={{ flex: 1, fontSize: '13px', color: 'var(--cs-text-1)' }}>
                                  {FREQ_LABELS[rule.frequency]} · {WEEKDAY_LABELS[rule.weekday]} · {String(rule.checkout_hour).padStart(2, '0')}:00 Uhr
                                  {rule.cleaners && <span style={{ color: 'var(--cs-text-3)', marginLeft: '6px' }}>· {rule.cleaners.name}</span>}
                                  {rule.notes   && <span style={{ color: 'var(--cs-text-3)', marginLeft: '6px' }}>· {rule.notes}</span>}
                                </div>
                                {/* Active toggle */}
                                <button
                                  onClick={() => toggleRuleActive(rule)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '2px 4px', opacity: rule.active ? 1 : 0.4 }}
                                  title={rule.active ? 'Aktiv — klicken zum Deaktivieren' : 'Inaktiv — klicken zum Aktivieren'}
                                >
                                  {rule.active ? '🟢' : '⚪'}
                                </button>
                                <button
                                  onClick={() => deleteRecurringRule(rule.id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cs-text-3)', fontSize: '15px', padding: '2px 4px' }}
                                >🗑</button>
                              </div>
                            ))}

                            {/* New rule form */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: rules.length > 0 ? '8px' : 0 }}>
                              <p style={{ fontSize: '11px', color: 'var(--cs-text-3)', margin: 0, fontWeight: '500' }}>Neue Regel</p>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <select
                                  className="cs-input"
                                  style={{ flex: '1', minWidth: '120px' }}
                                  value={form.frequency}
                                  onChange={e => setForm({ frequency: e.target.value as 'weekly' | 'biweekly' | 'monthly' })}
                                >
                                  <option value="weekly">Wöchentlich</option>
                                  <option value="biweekly">Alle 2 Wochen</option>
                                  <option value="monthly">Alle 4 Wochen</option>
                                </select>
                                <select
                                  className="cs-input"
                                  style={{ flex: '1', minWidth: '80px' }}
                                  value={form.weekday}
                                  onChange={e => setForm({ weekday: Number(e.target.value) })}
                                >
                                  {WEEKDAY_LABELS.map((d, i) => (
                                    <option key={i} value={i}>{d}</option>
                                  ))}
                                </select>
                                <input
                                  type="number"
                                  className="cs-input"
                                  style={{ flex: '1', minWidth: '70px' }}
                                  min={6} max={22}
                                  value={form.checkout_hour}
                                  onChange={e => setForm({ checkout_hour: Number(e.target.value) })}
                                  placeholder="Uhr Check-out"
                                />
                                <select
                                  className="cs-input"
                                  style={{ flex: '1', minWidth: '120px' }}
                                  value={form.cleaner_id}
                                  onChange={e => setForm({ cleaner_id: e.target.value })}
                                >
                                  <option value="">Reinigungskraft (optional)</option>
                                  {cleaners.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                              </div>
                              <input
                                className="cs-input"
                                placeholder="Notizen (optional)"
                                value={form.notes}
                                onChange={e => setForm({ notes: e.target.value })}
                              />
                              <button
                                onClick={() => addRecurringRule(p.id)}
                                className="cs-btn-primary"
                                style={{ fontSize: '13px', padding: '7px 16px', alignSelf: 'flex-start' }}
                              >
                                Regel hinzufügen
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })()}
                  </AnimatePresence>
                  </>
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
        </FadeInItem>

        {/* Reinigungskräfte */}
        <FadeInItem index={1} style={sectionStyle}>
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
                  <>
                    <div style={rowStyle}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: '500', fontSize: '14px', margin: '0 0 4px', color: 'var(--cs-text-1)' }}>{c.name}</p>
                        {c.telegram_chat_id ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '2px 8px', borderRadius: 99,
                            background: 'rgba(21,128,61,0.18)', color: '#86efac',
                            fontSize: 11, fontWeight: 500,
                          }}>
                            ✅ Telegram verbunden
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--cs-text-3)' }}>Kein Telegram verbunden</span>
                        )}
                      </div>
                      {c.telegram_chat_id ? (
                        <button onClick={() => createInvite(c.id)} className="cs-btn-secondary" style={{ fontSize: '12px', padding: '5px 12px', flexShrink: 0 }}>
                          Neu verbinden
                        </button>
                      ) : (
                        <button onClick={() => createInvite(c.id)} className="cs-btn-primary" style={{ fontSize: '12px', padding: '5px 12px', flexShrink: 0 }}>
                          Einladungslink erstellen
                        </button>
                      )}
                      <button onClick={() => setEditingCleaner(c)} className="cs-btn-secondary" style={{ fontSize: '12px', padding: '5px 12px' }}>Bearbeiten</button>
                      <button onClick={() => deleteCleaner(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cs-text-3)', fontSize: '16px', padding: '4px' }}>🗑</button>
                    </div>
                    <AnimatePresence initial={false}>
                      {expandedInvite === c.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{
                            padding: '12px 20px 16px',
                            background: 'var(--cs-surface-2)',
                            borderTop: '1px solid var(--cs-border)',
                          }}>
                            <div style={{
                              fontFamily: 'monospace', fontSize: 12,
                              color: 'var(--cs-text-2)', lineHeight: 1.6,
                              wordBreak: 'break-all', marginBottom: 10,
                              background: 'var(--cs-surface)',
                              border: '1px solid var(--cs-border)',
                              borderRadius: 8, padding: '8px 12px',
                            }}>
                              {inviteLinks[c.id]}
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => copyInviteLink(c.id)}
                                className="cs-btn-primary"
                                style={{ fontSize: 12, padding: '5px 12px' }}
                              >
                                {copyDone === c.id ? '✅ Kopiert!' : '📋 Kopieren'}
                              </button>
                              <button
                                onClick={() => setExpandedInvite(null)}
                                className="cs-btn-secondary"
                                style={{ fontSize: 12, padding: '5px 10px' }}
                              >
                                Schließen
                              </button>
                              <span style={{ fontSize: 11, color: 'var(--cs-text-3)' }}>
                                Senden Sie diesen Link Ihrer Reinigungskraft — gültig 72 Stunden.
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
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
        </FadeInItem>

        {/* Reinigungs-Garantie */}
        <FadeInItem index={2} style={sectionStyle}>
          <div className="cs-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--cs-border)' }}>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>🛡️ Reinigungs-Garantie</h2>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Toggle row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ ...labelStyle, marginBottom: '4px' }}>Auto-Backup aktivieren</p>
                  <p style={{ fontSize: '12px', color: 'var(--cs-text-3)', margin: 0, lineHeight: '1.5' }}>
                    {autoBackup
                      ? `Wenn Ihre Reinigungskraft nicht innerhalb von ${escalationHours} Stunden reagiert, übernimmt Reinraum automatisch.`
                      : 'Wenn Ihre Reinigungskraft nicht reagiert, erhalten Sie eine Warnung mit der Option, Reinraum zu beauftragen.'
                    }
                  </p>
                </div>
                <button
                  onClick={() => {
                    const next = !autoBackup
                    setAutoBackup(next)
                    saveBackup(next, escalationHours)
                  }}
                  aria-label="Auto-Backup"
                  style={{
                    flexShrink:   0,
                    width:        '44px',
                    height:       '24px',
                    background:   autoBackup ? 'var(--cs-blue)' : 'var(--cs-border)',
                    borderRadius: '12px',
                    border:       'none',
                    cursor:       'pointer',
                    padding:      '2px',
                    transition:   'background 0.2s ease',
                    position:     'relative',
                    marginTop:    '2px',
                  }}
                >
                  <span style={{
                    display:      'block',
                    width:        '20px',
                    height:       '20px',
                    background:   'white',
                    borderRadius: '50%',
                    transform:    autoBackup ? 'translateX(20px)' : 'translateX(0)',
                    transition:   'transform 0.2s ease',
                  }} />
                </button>
              </div>

              {/* Wartezeit select */}
              <div>
                <label style={labelStyle}>Wartezeit bis Benachrichtigung</label>
                <select
                  className="cs-input"
                  value={escalationHours}
                  onChange={e => {
                    const h = Number(e.target.value)
                    setEscalationHours(h)
                    saveBackup(autoBackup, h)
                  }}
                  style={{ width: 'auto', minWidth: '140px' }}
                >
                  {[2, 4, 8, 12].map(h => (
                    <option key={h} value={h}>{h} Stunden</option>
                  ))}
                </select>
              </div>

            </div>
          </div>
        </FadeInItem>

        {/* Telegram-Benachrichtigungen */}
        <FadeInItem index={3} style={sectionStyle}>
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
        </FadeInItem>

      </main>

    </div>
  )
}
