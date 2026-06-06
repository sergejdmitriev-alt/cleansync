'use client';

import { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

const PROPERTIES_OPTIONS = [
  { value: '1', label: '1 Objekt' },
  { value: '2-5', label: '2–5 Objekte' },
  { value: '6-10', label: '6–10 Objekte' },
  { value: '10+', label: 'Mehr als 10' },
];

type FormState = 'idle' | 'loading' | 'success' | 'error';

const FAQS = [
  {
    q: 'Braucht meine Reinigungskraft ein Smartphone?',
    a: 'Ja, nur Telegram. Die App ist kostenlos und auf jedem Smartphone verfügbar. Keine Registrierung für die Reinigungskraft nötig.',
  },
  {
    q: 'Funktioniert das auch ohne Airbnb?',
    a: 'Ja. Sie können Aufgaben auch manuell erstellen — ohne Kalender-Sync. Airbnb macht es nur vollautomatisch.',
  },
  {
    q: 'Was passiert wenn die Reinigungskraft ablehnt?',
    a: 'Sie bekommen sofort eine Benachrichtigung und können die Aufgabe an jemand anderen senden oder Reinraum beauftragen.',
  },
  {
    q: 'Sind meine Daten sicher?',
    a: 'Ja. Alle Daten liegen in einer europäischen Datenbank (Supabase EU), Fotos werden automatisch nach 90 Tagen gelöscht.',
  },
];

export default function LeadPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', properties: '', message: '' });
  const [state, setState] = useState<FormState>('idle');
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [objects, setObjects] = useState(5);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, turnstileToken }),
      });
      if (!res.ok) throw new Error();
      setState('success');
    } catch {
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <main className="lead-wrap">
        <div className="lead-card success-card">
          <div className="success-icon">✓</div>
          <h2>Vielen Dank!</h2>
          <p>Wir melden uns innerhalb von 24 Stunden.<br />Schauen Sie in Ihren Posteingang: <strong>{form.email}</strong></p>
        </div>
        <style>{styles}</style>
      </main>
    );
  }

  return (
    <main className="lead-wrap">
      <header className="lead-header">
        <div className="lead-logo"><span className="logo-icon">✦</span><span>CleanSync</span></div>
        <span className="lead-badge">Für Airbnb-Hosts in Wien</span>
      </header>

      <section className="lead-hero">
        <h1>Übergaben automatisch.<br />Fotos, Bestätigungen, alles.</h1>
        <p className="lead-sub">CleanSync verbindet Ihre Reinigungskräfte mit Ihrem Kalender — kein WhatsApp-Chaos, keine verpassten Checkouts.</p>
      </section>

      <div className="calc-card">
        <div className="calc-title">Wie viel sparen Sie mit CleanSync?</div>
        <div className="calc-sub">Ø 20 Min. Koordinationsaufwand pro Reinigung · 12 €/Std.</div>

        <div className="slider-label">
          <span>Anzahl der Objekte</span>
          <span className="slider-value">{objects}</span>
        </div>

        <input
          type="range"
          min={1}
          max={20}
          value={objects}
          onChange={(e) => setObjects(parseInt(e.target.value))}
          className="calc-slider"
        />

        <div className="calc-results">
          <div className="calc-box">
            <div className="calc-number">{objects * 8}</div>
            <div className="calc-label">Reinigungen / Monat</div>
          </div>
          <div className="calc-box">
            <div className="calc-number">{(objects * 8 * 20 / 60).toFixed(1)}h</div>
            <div className="calc-label">Stunden gespart / Monat</div>
          </div>
          <div className="calc-box">
            <div className="calc-number green">{Math.round(objects * 8 * 20 / 60 * 12)} €</div>
            <div className="calc-label">Kosten gespart / Monat</div>
          </div>
        </div>

        <div className="calc-yearly">
          → Das sind {(Math.round(objects * 8 * 20 / 60 * 12) * 12).toLocaleString('de-AT')} € pro Jahr
        </div>
      </div>

      <div className="how-section">
        <h2 className="how-title">So funktioniert CleanSync</h2>
        <div className="how-steps">
          <div className="how-step">
            <div className="how-icon">🗓</div>
            <div className="how-line" />
            <div className="how-step-title">Kalender sync</div>
            <div className="how-step-desc">Airbnb-Kalender verbindet sich automatisch — neue Buchungen erscheinen sofort als Aufgaben</div>
          </div>
          <div className="how-step">
            <div className="how-icon">💬</div>
            <div className="how-line" />
            <div className="how-step-title">Bot sendet Aufgabe</div>
            <div className="how-step-desc">Die Reinigungskraft bekommt eine Telegram-Nachricht mit Datum, Uhrzeit und Notizen</div>
          </div>
          <div className="how-step">
            <div className="how-icon">✅</div>
            <div className="how-line" />
            <div className="how-step-title">Bestätigung</div>
            <div className="how-step-desc">Die Reinigungskraft bestätigt oder lehnt ab — Sie sehen den Status live im Dashboard</div>
          </div>
          <div className="how-step">
            <div className="how-icon">📸</div>
            <div className="how-line last" />
            <div className="how-step-title">Foto als Nachweis</div>
            <div className="how-step-desc">Nach der Reinigung sendet die Kraft Fotos — automatisch gespeichert, jederzeit abrufbar</div>
          </div>
        </div>
      </div>

      <div className="lead-card">
        <h2 className="form-title">Kostenlose Demo anfragen</h2>
        <form onSubmit={handleSubmit} className="lead-form" noValidate>
          <div className="field-group">
            <label htmlFor="name">Ihr Name *</label>
            <input id="name" name="name" type="text" placeholder="Max Mustermann" value={form.name} onChange={handleChange} required />
          </div>
          <div className="field-row">
            <div className="field-group">
              <label htmlFor="email">E-Mail *</label>
              <input id="email" name="email" type="email" placeholder="max@beispiel.at" value={form.email} onChange={handleChange} required />
            </div>
            <div className="field-group">
              <label htmlFor="phone">Telefon *</label>
              <input id="phone" name="phone" type="tel" placeholder="+43 664 …" value={form.phone} onChange={handleChange} required />
            </div>
          </div>
          <div className="field-group">
            <label htmlFor="properties">Anzahl der Objekte *</label>
            <select id="properties" name="properties" value={form.properties} onChange={handleChange} required>
              <option value="" disabled>Bitte wählen …</option>
              {PROPERTIES_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="field-group">
            <label htmlFor="message">Ihre aktuelle Situation <span className="optional">(optional)</span></label>
            <textarea id="message" name="message" rows={3} placeholder="Wie koordinieren Sie Ihre Reinigungen gerade?" value={form.message} onChange={handleChange} />
          </div>
          {state === 'error' && <p className="form-error">Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.</p>}
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={(token) => setTurnstileToken(token)}
          />
          <button type="submit" className="submit-btn" disabled={state === 'loading' || !turnstileToken}>
            {state === 'loading' ? 'Wird gesendet …' : 'Demo anfragen →'}
          </button>
          <p className="form-note">Kein Spam. Keine Verpflichtung. Wir melden uns persönlich.</p>
        </form>
      </div>

      <div className="faq-section">
        <h2 className="faq-title">Häufige Fragen</h2>
        {FAQS.map((faq, i) => (
          <div key={i} className="faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
            <div className="faq-question">
              <span>{faq.q}</span>
              <span className="faq-arrow">{openFaq === i ? '−' : '+'}</span>
            </div>
            {openFaq === i && <div className="faq-answer">{faq.a}</div>}
          </div>
        ))}
      </div>

      <div className="trust-row">
        <div className="trust-item"><span>🗓</span><span>iCal-Sync mit Airbnb</span></div>
        <div className="trust-item"><span>📸</span><span>Foto-Nachweis der Reinigung</span></div>
        <div className="trust-item"><span>💬</span><span>Telegram-Bot für Reinigungskräfte</span></div>
      </div>

      <style>{styles}</style>
    </main>
  );
}

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #f8f8f6; color: #1a1a1a; -webkit-font-smoothing: antialiased; }
  .lead-wrap { min-height: 100vh; max-width: 640px; margin: 0 auto; padding: 24px 16px 60px; display: flex; flex-direction: column; gap: 24px; }
  .lead-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
  .lead-logo { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 18px; }
  .logo-icon { color: #2563eb; font-size: 20px; }
  .lead-badge { font-size: 12px; font-weight: 600; color: #2563eb; background: #eff6ff; border: 1px solid #bfdbfe; padding: 4px 10px; border-radius: 20px; }
  .lead-hero h1 { font-size: clamp(24px, 5vw, 32px); font-weight: 800; line-height: 1.2; letter-spacing: -0.5px; margin-bottom: 12px; }
  .lead-sub { font-size: 15px; color: #555; line-height: 1.6; }
  .lead-card { background: #fff; border-radius: 16px; padding: 28px 24px; border: 1px solid #e5e5e5; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
  .form-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; }
  .lead-form { display: flex; flex-direction: column; gap: 16px; }
  .field-group { display: flex; flex-direction: column; gap: 6px; flex: 1; }
  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 400px) { .field-row { grid-template-columns: 1fr; } }
  label { font-size: 13px; font-weight: 600; color: #444; }
  .optional { font-weight: 400; color: #999; }
  input, select, textarea { width: 100%; padding: 10px 12px; border: 1.5px solid #e0e0e0; border-radius: 8px; font-size: 14px; font-family: inherit; color: #1a1a1a; background: #fafafa; transition: border-color 0.15s; outline: none; }
  input:focus, select:focus, textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); background: #fff; }
  textarea { resize: vertical; min-height: 72px; }
  .form-error { font-size: 13px; color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 8px 12px; border-radius: 8px; }
  .submit-btn { width: 100%; padding: 13px; background: #2563eb; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; font-family: inherit; cursor: pointer; transition: background 0.15s; }
  .submit-btn:hover:not(:disabled) { background: #1d4ed8; }
  .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .form-note { text-align: center; font-size: 12px; color: #aaa; }
  .trust-row { display: flex; flex-direction: column; gap: 10px; padding: 0 4px; }
  .trust-item { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #555; font-weight: 500; }
  .success-card { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; padding: 40px 24px; margin-top: 60px; }
  .success-icon { width: 56px; height: 56px; background: #dcfce7; color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; }
  .success-card h2 { font-size: 22px; font-weight: 800; }
  .success-card p { font-size: 15px; color: #555; line-height: 1.6; }
  .calc-card { background: #fff; border-radius: 16px; padding: 28px 24px; border: 1px solid #e5e5e5; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
  .calc-title { font-size: 16px; font-weight: 700; color: #111; margin-bottom: 4px; }
  .calc-sub { font-size: 13px; color: #888; margin-bottom: 24px; }
  .slider-label { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .slider-label span:first-child { font-size: 14px; font-weight: 600; color: #444; }
  .slider-value { font-size: 20px; font-weight: 800; color: #2563eb; }
  .calc-slider { width: 100%; height: 6px; border-radius: 3px; background: #e0e0e0; outline: none; -webkit-appearance: none; appearance: none; margin-bottom: 24px; cursor: pointer; }
  .calc-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; background: #2563eb; cursor: pointer; box-shadow: 0 2px 6px rgba(37,99,235,0.3); }
  .calc-results { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
  .calc-box { background: #f4f4f2; border-radius: 12px; padding: 16px 12px; text-align: center; }
  .calc-number { font-size: 24px; font-weight: 800; color: #111; margin-bottom: 6px; line-height: 1; }
  .calc-number.green { color: #16a34a; }
  .calc-label { font-size: 11px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.4px; line-height: 1.3; }
  .calc-yearly { font-size: 13px; color: #555; text-align: center; font-weight: 500; }
  .how-section { padding: 8px 0; }
  .how-title { font-size: 18px; font-weight: 800; color: #111; margin-bottom: 24px; text-align: center; }
  .how-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  @media (max-width: 520px) { .how-steps { grid-template-columns: repeat(2, 1fr); gap: 16px; } }
  .how-step { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; }
  .how-icon { width: 52px; height: 52px; background: #eff6ff; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
  .how-step-title { font-size: 13px; font-weight: 700; color: #111; }
  .how-step-desc { font-size: 12px; color: #777; line-height: 1.5; }
  .how-line { display: none; }
  .faq-section { display: flex; flex-direction: column; gap: 0; }
  .faq-title { font-size: 18px; font-weight: 800; color: #111; margin-bottom: 16px; }
  .faq-item { border-bottom: 1px solid #eee; padding: 16px 0; cursor: pointer; }
  .faq-item:first-of-type { border-top: 1px solid #eee; }
  .faq-question { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  .faq-question span:first-child { font-size: 14px; font-weight: 600; color: #111; line-height: 1.4; }
  .faq-arrow { font-size: 20px; color: #2563eb; font-weight: 300; flex-shrink: 0; }
  .faq-answer { font-size: 13px; color: #555; line-height: 1.7; margin-top: 10px; }
`;
