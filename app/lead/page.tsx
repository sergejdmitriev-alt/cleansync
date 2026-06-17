'use client'

import { useState, useEffect, useRef } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'
import {
  motion, AnimatePresence, useReducedMotion,
  useMotionValue, animate, type MotionValue,
} from 'framer-motion'

// ── Types ─────────────────────────────────────────────────────────
type FormState = 'idle' | 'loading' | 'success' | 'error'
type Lang      = 'de' | 'en'

// ── Shared config ─────────────────────────────────────────────────
const SPRING = { type: 'spring', stiffness: 300, damping: 28 } as const
const VP     = { once: true, amount: 0.2 }                    as const

// ── i18n dictionary ───────────────────────────────────────────────
// TODO: Replace/extend with reviews from real STR hosts once available — current reviews are about cleaning quality (Reinraum private clients)
const REVIEWS = [
  { text: 'Reinraum hat tolle Arbeit geleistet — alles perfekt sauber, professionell und pünktlich. Absolut empfehlenswert.', author: '' },
  { text: 'Profis in ihrem Bereich. Alles sauber und ordentlich, pünktlich und angenehm im Umgang. Ich werde auf jeden Fall wieder buchen.', author: 'Maria' },
  { text: 'Meine Wohnung war noch nie so makellos. Das Team achtet auf jedes Detail — selbst die kleinsten Ecken. Professionell, freundlich und immer pünktlich.', author: '' },
  { text: 'Vielen Dank für die tolle Arbeit! Pünktlich, angenehm in der Kommunikation und eine wunderbar geputzte Wohnung.', author: '' },
]

const T = {
  de: {
    headerBadge: 'Für Airbnb-Hosts in Wien',
    // Hero
    heroTitle:   'Übergaben automatisch.\nFotos, Bestätigungen, alles.',
    heroSub:     'CleanSync verbindet Ihre Reinigungskräfte mit Ihrem Kalender —\nkein WhatsApp-Chaos, keine verpassten Checkouts.',
    heroCta:     'Unverbindlich ansehen →',
    // Trust-bar
    trustBar: [
      '✦ über 20 Wohnungen in Wien betreut',
      '✦ seit über 3 Jahren im Einsatz',
      '✦ Antwort meist in Minuten',
      '✦ fast jeder Auftrag wird angenommen',
    ],
    // Telegram demo
    demoLabel: 'So sieht es aus',
    demoTitle: 'Ihr Reinigungsbot in Aktion',
    chatMessages: [
      { side: 'bot',  text: '🏠 Neue Reinigung\n📅 Mo 16.06 · 11:00–15:00\n📍 Bergstraße 12, Wien\n\n✅ Annehmen   ❌ Ablehnen', label: '' },
      { side: 'user', text: '✅ Angenommen', label: '' },
      { side: 'bot',  text: '🏁 Reinigung abgeschlossen\n📷 3 Fotos hochgeladen', label: '' },
      { side: 'host', text: '✓ Erledigt — Fotos gespeichert', label: 'Sie (Host)' },
    ],
    // Compare
    compareLabel:  'Vergleich',
    compareTitle:  'Vorher & Nachher',
    beforeLabel:   '❌ Ohne CleanSync',
    afterLabel:    '✅ Mit CleanSync',
    beforeItems: [
      'WhatsApp-Chaos mit mehreren Gruppenchats',
      'Reinigungskraft vergisst den Termin',
      'Kein Foto-Nachweis bei Reklamationen',
      'Manuelle Koordination — 20 Min. pro Tag',
      'Verpasster Checkout → schlechte Bewertung',
    ],
    afterItems: [
      'Ein Dashboard für alle Aufträge',
      'Automatische Telegram-Benachrichtigung',
      'Fotos als Qualitätsnachweis gespeichert',
      'Vollautomatisch — 0 Minuten pro Tag',
      'Kalender-Sync, kein Checkout vergessen',
    ],
    // Calculator
    calcLabel:        'Rechner',
    calcTitle:        'Wie viel sparen Sie?',
    calcNote:         'Ø 20 Min. Koordination pro Reinigung · 12 €/Std.',
    calcObjectsLabel: 'Anzahl der Objekte',
    calcSubs:         ['Reinigungen / Monat', 'Stunden gespart / Mo.', 'Kosten gespart / Mo.'] as [string, string, string],
    calcLocale:       'de-AT',
    calcYearPre:      '→ Das sind',
    calcYearPost:     '€ pro Jahr',
    calcRiskTitle:    'Was Sie das Reinigungs-Chaos im Monat kostet:',
    calcRisks: [
      'Gast checkt ein, die Wohnung ist noch nicht sauber → schlechte Bewertung',
      'Eine Bewertung unter 4,8 ★ kostet Sie Sichtbarkeit und Buchungen',
      'Abende voller Nachrichten und Anrufe statt Vermietung',
    ],
    calcBridge: 'Genau das nimmt Ihnen CleanSync ab: Ein Tipp — die Reinigung ist vergeben, bestätigt und mit Foto belegt. Falls keine eigene Kraft frei ist, übernimmt das Reinraum-Team — über 20 Wohnungen in Wien, Antwort meist in Minuten.',
    calcCta:    'Unverbindlich ansehen →',
    // Garantie
    garantieTitle: 'Reinigungs-Garantie',
    garantieDesc:  'Jede Reinigung wird mit Fotos dokumentiert. Bei Reklamationen liefern Sie den Nachweis mit einem Klick — kein Streit, klare Fakten.',
    // How-it-works
    howLabel: 'Ablauf',
    howTitle: 'So funktioniert CleanSync',
    steps: [
      { icon: '📅', title: 'Kalender sync',      desc: 'Airbnb-Kalender verbindet sich automatisch — neue Buchungen erscheinen sofort als Aufgaben' },
      { icon: '💬', title: 'Bot sendet Aufgabe', desc: 'Die Reinigungskraft bekommt eine Telegram-Nachricht mit Datum, Uhrzeit und Notizen'          },
      { icon: '✅', title: 'Bestätigung',         desc: 'Reinigungskraft bestätigt oder lehnt ab — Sie sehen den Status live im Dashboard'             },
      { icon: '📷', title: 'Foto als Nachweis',  desc: 'Nach der Reinigung werden Fotos gesendet — automatisch gespeichert, jederzeit abrufbar'       },
    ],
    // Reviews
    reviewsLabel: 'Bewertungen',
    reviewsTitle: 'Das sagen unsere Reinigungskunden in Wien',
    reviewsNote:  'Bewertungen zur Reinigungsqualität von Reinraum.',
    // FAQ
    faqLabel: 'FAQ',
    faqTitle: 'Häufige Fragen',
    faqs: [
      { q: 'Braucht meine Reinigungskraft ein Smartphone?',  a: 'Ja, nur Telegram. Die App ist kostenlos und auf jedem Smartphone verfügbar. Keine Registrierung nötig.'           },
      { q: 'Funktioniert das auch ohne Airbnb?',             a: 'Ja. Aufgaben können auch manuell erstellt werden — ohne Kalender-Sync. Airbnb macht es vollautomatisch.'            },
      { q: 'Was passiert wenn die Reinigungskraft ablehnt?', a: 'Sie bekommen sofort eine Benachrichtigung und können die Aufgabe an jemand anderen senden oder Reinraum beauftragen.' },
      { q: 'Sind meine Daten sicher?',                       a: 'Ja. Alle Daten liegen in einer europäischen Datenbank (Supabase EU), Fotos werden automatisch nach 90 Tagen gelöscht.' },
    ],
    // Guide form
    guideBadgeText: 'Gratis-Leitfaden',
    guideTitle:     'Der perfekte Gästewechsel in 7 Schritten',
    guideDesc:      'Inklusive druckbarer Reinigungs-Checkliste, die Sie Ihrer Reinigungskraft direkt mitgeben können. Kein Verkaufsgespräch — nur das System, das den Wechsel reibungslos macht.',
    guideHint:      '→ E-Mail eintragen und Leitfaden sofort als PDF erhalten.',
    // Form
    formNameLabel:          'Ihr Name *',
    formNamePlaceholder:    'Max Mustermann',
    formEmailLabel:         'E-Mail *',
    formEmailPlaceholder:   'max@beispiel.at',
    formPhoneLabel:         'Telefon *',
    formPhonePlaceholder:   '+43 664 …',
    formPropertiesLabel:    'Anzahl der Objekte *',
    formPropertiesDefault:  'Bitte wählen …',
    formPropertiesOptions:  [
      { value: '1',    label: '1 Objekt'     },
      { value: '2-5',  label: '2–5 Objekte'  },
      { value: '6-10', label: '6–10 Objekte' },
      { value: '10+',  label: 'Mehr als 10'  },
    ],
    formMessageLabel:       'Ihre aktuelle Situation',
    formMessageOptional:    '(optional)',
    formMessagePlaceholder: 'Wie koordinieren Sie Ihre Reinigungen gerade?',
    formError:              'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
    formSubmit:             'Leitfaden erhalten →',
    formSending:            'Wird gesendet …',
    tgAlt:                  'Oder direkt auf Telegram:',
    // Success
    successTitle:    'Ihr Leitfaden ist bereit.',
    successBodyPre:  'Wir haben Ihnen auch eine E-Mail an',
    successBodyPost: 'geschickt.',
    successDownload: '↓ Leitfaden herunterladen (PDF)',
    successNote:     'Wir melden uns auch persönlich innerhalb von 24 Stunden.',
    // Free-tier
    freeBadgeText: 'Kostenlos',
    freeTagline:   'Kein Abo. Keine Kreditkarte.',
    freeTitle:     'Ein Objekt. Für immer kostenlos.',
    freeItems:     ['1 Objekt', 'Telegram-Bot für Ihre Reinigungskraft', 'iCal-Sync mit Airbnb'],
    freeLater:     'Später hinzufügen',
    freePaid:      ['Reinraum-Dispatch bei Ausfall', 'PDF-Reinigungsprotokoll'],
    freeBtn:       'Kostenlos starten →',
    // Trust strip
    trustItems: [
      ['📅', 'iCal-Sync mit Airbnb'],
      ['📷', 'Foto-Nachweis der Reinigung'],
      ['💬', 'Telegram-Bot für Reinigungskräfte'],
      ['🔒', 'Daten in der EU (Supabase)'],
    ] as [string, string][],
  },

  en: {
    headerBadge: 'For Airbnb hosts in Vienna',
    // Hero
    heroTitle:   'Turnovers automated.\nPhotos, confirmations, everything.',
    heroSub:     'CleanSync connects your cleaners to your calendar —\nno WhatsApp chaos, no missed checkouts.',
    heroCta:     'See it — no commitment →',
    // Trust-bar
    trustBar: [
      '✦ 20+ properties managed in Vienna',
      '✦ 3+ years of real cleaning operations',
      '✦ replies usually within minutes',
      '✦ nearly every request accepted',
    ],
    // Telegram demo
    demoLabel: 'See it in action',
    demoTitle: 'Your cleaning bot in action',
    chatMessages: [
      { side: 'bot',  text: '🏠 New cleaning\n📅 Mon 16.06 · 11:00–15:00\n📍 Bergstraße 12, Vienna\n\n✅ Accept   ❌ Decline', label: '' },
      { side: 'user', text: '✅ Accepted', label: '' },
      { side: 'bot',  text: '🏁 Cleaning complete\n📷 3 photos uploaded', label: '' },
      { side: 'host', text: '✓ Done — Photos saved', label: 'You (Host)' },
    ],
    // Compare
    compareLabel:  'Before & after',
    compareTitle:  'Before & After',
    beforeLabel:   '❌ Without CleanSync',
    afterLabel:    '✅ With CleanSync',
    beforeItems: [
      'WhatsApp chaos with multiple group chats',
      'Cleaner forgets the appointment',
      'No photo proof for disputes',
      'Manual coordination — 20 min per day',
      'Missed checkout → bad review',
    ],
    afterItems: [
      'One dashboard for all jobs',
      'Automatic Telegram notification',
      'Photos saved as quality proof',
      'Fully automated — 0 minutes per day',
      'Calendar sync, no checkout missed',
    ],
    // Calculator
    calcLabel:        'Calculator',
    calcTitle:        'How much do you save?',
    calcNote:         'Avg. 20 min coordination per cleaning · €12/hr',
    calcObjectsLabel: 'Number of properties',
    calcSubs:         ['cleanings / month', 'hours saved / mo.', 'costs saved / mo.'] as [string, string, string],
    calcLocale:       'en-US',
    calcYearPre:      "→ That's",
    calcYearPost:     '€ per year',
    calcRiskTitle:    'What cleaning chaos costs you each month:',
    calcRisks: [
      "Guest checks in, the place isn't clean yet → bad review",
      'A single review under 4.8 ★ costs you visibility and bookings',
      'Evenings full of messages and calls instead of hosting',
    ],
    calcBridge: "That's exactly what CleanSync takes off your plate: one tap — the cleaning is assigned, confirmed and photo-verified. No cleaner of your own free? The Reinraum team steps in — 20+ properties in Vienna, replies usually within minutes.",
    calcCta:    'See it — no commitment →',
    // Garantie
    garantieTitle: 'Cleaning Guarantee',
    garantieDesc:  'Every cleaning is documented with photos. When disputes come up, you have proof in one click — no argument, clear facts.',
    // How-it-works
    howLabel: 'How it works',
    howTitle: 'How CleanSync works',
    steps: [
      { icon: '📅', title: 'Calendar sync',     desc: 'Your Airbnb calendar connects automatically — new bookings appear instantly as tasks'            },
      { icon: '💬', title: 'Bot sends the job', desc: 'The cleaner gets a Telegram message with date, time and notes'                                  },
      { icon: '✅', title: 'Confirmation',       desc: 'Cleaner accepts or declines — you see the status live in the dashboard'                        },
      { icon: '📷', title: 'Photo as proof',    desc: 'After cleaning, photos are sent — automatically saved and accessible any time'                  },
    ],
    // Reviews
    reviewsLabel: 'Reviews',
    reviewsTitle: 'What our cleaning clients in Vienna say',
    reviewsNote:  "Reviews of Reinraum's cleaning quality.",
    // FAQ
    faqLabel: 'FAQ',
    faqTitle: 'Common questions',
    faqs: [
      { q: 'Does my cleaner need a smartphone?',    a: 'Yes, just Telegram. The app is free and available on any smartphone. No account registration needed.'          },
      { q: 'Does this work without Airbnb?',         a: 'Yes. Tasks can also be created manually — without calendar sync. Airbnb makes it fully automatic.'            },
      { q: 'What happens if the cleaner declines?',  a: 'You get a notification immediately and can send the task to someone else or call in the Reinraum team.'      },
      { q: 'Is my data secure?',                     a: 'Yes. All data is stored in a European database (Supabase EU), and photos are automatically deleted after 90 days.' },
    ],
    // Guide form
    guideBadgeText: 'Free guide',
    guideTitle:     'The Perfect Guest Turnover in 7 Steps',
    guideDesc:      "Includes a printable cleaning checklist you can hand straight to your cleaner. No sales pitch — just the system Vienna hosts use to keep turnovers clean.",
    guideHint:      '→ Enter your email and get the PDF instantly.',
    // Form
    formNameLabel:          'Your name *',
    formNamePlaceholder:    'Jane Smith',
    formEmailLabel:         'Email *',
    formEmailPlaceholder:   'jane@example.com',
    formPhoneLabel:         'Phone *',
    formPhonePlaceholder:   '+1 234 …',
    formPropertiesLabel:    'Number of properties *',
    formPropertiesDefault:  'Please select …',
    formPropertiesOptions:  [
      { value: '1',    label: '1 property'    },
      { value: '2-5',  label: '2–5 properties'},
      { value: '6-10', label: '6–10 properties'},
      { value: '10+',  label: 'More than 10'  },
    ],
    formMessageLabel:       'Your current situation',
    formMessageOptional:    '(optional)',
    formMessagePlaceholder: 'How do you currently coordinate your cleanings?',
    formError:              'Something went wrong. Please try again.',
    formSubmit:             'Get the guide →',
    formSending:            'Sending …',
    tgAlt:                  'Or reach us on Telegram:',
    // Success
    successTitle:    'Check your inbox — your guide is on the way.',
    successBodyPre:  "We've sent the PDF to",
    successBodyPost: '. You can also download it directly:',
    successDownload: '↓ Download the guide (PDF)',
    successNote:     "We'll also follow up personally within 24 hours.",
    // Free-tier
    freeBadgeText: 'Free',
    freeTagline:   'No subscription. No credit card.',
    freeTitle:     'One property. Free forever.',
    freeItems:     ['1 property', 'Telegram bot for your cleaner', 'iCal sync with Airbnb'],
    freeLater:     'Add later',
    freePaid:      ['Reinraum dispatch cover', 'PDF cleaning report'],
    freeBtn:       'Start for free →',
    // Trust strip
    trustItems: [
      ['📅', 'iCal sync with Airbnb'],
      ['📷', 'Photo proof of every cleaning'],
      ['💬', 'Telegram bot for cleaners'],
      ['🔒', 'Data in EU (Supabase)'],
    ] as [string, string][],
  },
}

// ── Animated counter ──────────────────────────────────────────────
function Counter({ mv, fmt = (v: number) => String(Math.round(v)) }: {
  mv:   MotionValue<number>
  fmt?: (v: number) => string
}) {
  const [val, setVal] = useState(mv.get())
  useEffect(() => mv.on('change', v => setVal(v)), [mv])
  return <>{fmt(val)}</>
}

// ── Telegram SVG icon ─────────────────────────────────────────────
function TgIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#3b7ef8" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────
export default function LeadPage() {
  const reduced = useReducedMotion()
  const formRef = useRef<HTMLDivElement>(null)

  const [lang, setLang]           = useState<Lang>('de') // SSR-safe default
  const [form, setForm]           = useState({ name: '', email: '', phone: '', properties: '', message: '' })
  const [formState, setFormState] = useState<FormState>('idle')
  const [turnstileToken, setTurnstileToken] = useState('')

  const [objects, setObjects]       = useState(5)
  const [didCountUp, setDidCountUp] = useState(false)
  const [pulseKey, setPulseKey]     = useState(0)

  const cleaningsMV = useMotionValue(0)
  const hoursMV     = useMotionValue(0)
  const savingsMV   = useMotionValue(0)

  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Detect browser language after mount to avoid hydration mismatch
  useEffect(() => {
    const nav = navigator.language?.toLowerCase().startsWith('de') ? 'de' : 'en'
    setLang(nav)
  }, [])

  function calcVals(n: number) {
    return {
      cleanings: n * 8,
      hours:     Math.round(n * 8 * 20 / 60 * 10) / 10,
      savings:   Math.round(n * 8 * 20 / 60 * 12),
    }
  }

  function animateCalc(n: number, dur = 0.5) {
    const { cleanings, hours, savings } = calcVals(n)
    animate(cleaningsMV, cleanings, { duration: dur, ease: [0.25, 0.1, 0.25, 1] })
    animate(hoursMV,     hours,     { duration: dur, ease: [0.25, 0.1, 0.25, 1] })
    animate(savingsMV,   savings,   { duration: dur, ease: [0.25, 0.1, 0.25, 1] })
  }

  function handleSlider(n: number) {
    setObjects(n)
    setPulseKey(k => k + 1)
    animateCalc(n)
  }

  function handleViewportEnter() {
    if (!didCountUp) {
      setDidCountUp(true)
      animateCalc(objects, 0.85)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormState('loading')
    try {
      const res = await fetch('/api/lead', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, turnstileToken, lang }),
      })
      if (!res.ok) throw new Error()
      setFormState('success')
    } catch {
      setFormState('error')
    }
  }

  function fy(delay = 0) {
    if (reduced) return { initial: {}, whileInView: {}, viewport: VP, transition: {} }
    return {
      initial:     { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      viewport:    VP,
      transition:  { ...SPRING, delay },
    }
  }

  const { savings: savingsNow } = calcVals(objects)
  const tx = T[lang]

  // ── Success screen ─────────────────────────────────────────────
  if (formState === 'success') {
    return (
      <main style={S.wrap}>
        <motion.div
          style={{ ...S.glass, textAlign: 'center', padding: '52px 32px', marginTop: 60 }}
          initial={reduced ? {} : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING}
        >
          <motion.div
            style={S.successIcon}
            initial={reduced ? {} : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ ...SPRING, delay: 0.15 }}
          >✓</motion.div>
          <h2 style={{ color: '#e8eaf0', fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
            {tx.successTitle}
          </h2>
          <p style={{ color: '#8892a4', fontSize: 14, lineHeight: 1.65, marginBottom: 24 }}>
            {tx.successBodyPre}{' '}
            <strong style={{ color: '#e8eaf0' }}>{form.email}</strong>
            {tx.successBodyPost}
          </p>
          <a
            href={`/api/guide/turnover?lang=${lang}`}
            download
            style={S.guideDownloadBtn}
            className="lead-guide-dl"
          >
            {tx.successDownload}
          </a>
          <p style={{ color: '#4a5568', fontSize: 12, marginTop: 20 }}>
            {tx.successNote}
          </p>
        </motion.div>
      </main>
    )
  }

  // ── Main render ────────────────────────────────────────────────
  return (
    <main style={S.wrap}>

      {/* Header */}
      <header style={S.header}>
        <div style={S.logo}>
          <span style={{ color: '#3b7ef8', fontSize: 22, lineHeight: 1 }}>✦</span>
          <span style={{ fontWeight: 700, fontSize: 17 }}>CleanSync</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const }}>
          <span style={S.badge}>{tx.headerBadge}</span>
          <div style={S.langToggle}>
            <button
              className="lead-lang-btn"
              onClick={() => setLang('de')}
              style={{ ...S.langBtn, ...(lang === 'de' ? S.langBtnActive : {}) }}
            >DE</button>
            <button
              className="lead-lang-btn"
              onClick={() => setLang('en')}
              style={{ ...S.langBtn, ...(lang === 'en' ? S.langBtnActive : {}) }}
            >EN</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section>
        <motion.h1 style={{ ...S.h1, whiteSpace: 'pre-line' }} {...fy(0)}>
          {tx.heroTitle}
        </motion.h1>
        <motion.p style={{ ...S.sub, whiteSpace: 'pre-line' }} {...fy(0.06)}>
          {tx.heroSub}
        </motion.p>
        <motion.div {...fy(0.12)} style={{ marginTop: 28 }}>
          <button
            className="lead-cta"
            style={S.ctaBtn}
            onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            {tx.heroCta}
          </button>
        </motion.div>
      </section>

      {/* Trust-bar */}
      <motion.div className="lead-trust-bar" style={S.trustBarGrid} {...fy(0.04)}>
        {tx.trustBar.map(text => (
          <div key={text} style={S.trustBarItem}>{text}</div>
        ))}
      </motion.div>

      {/* Telegram demo */}
      <motion.div style={S.glass} {...fy(0)}>
        <p style={S.sectionLabel}>{tx.demoLabel}</p>
        <h2 style={S.sectionH2}>{tx.demoTitle}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tx.chatMessages.map((msg, i) => (
            <motion.div
              key={i}
              style={{
                ...S.bubble,
                ...(msg.side === 'bot'  ? S.bubbleBot  :
                    msg.side === 'user' ? S.bubbleUser :
                                          S.bubbleHost),
              }}
              initial={reduced ? {} : { opacity: 0, x: msg.side === 'bot' ? -14 : 14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={VP}
              transition={{ ...SPRING, delay: i * 0.11 }}
            >
              {msg.label && <span style={S.bubbleLabel}>{msg.label}</span>}
              <span style={{ whiteSpace: 'pre-line', fontSize: 13, lineHeight: 1.55 }}>{msg.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Vorher / Nachher */}
      <motion.div style={S.glass} {...fy(0)}>
        <p style={S.sectionLabel}>{tx.compareLabel}</p>
        <h2 style={S.sectionH2}>{tx.compareTitle}</h2>
        <div className="lead-compare-grid" style={S.compareGrid}>
          <div style={S.compareBefore}>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#fca5a5', marginBottom: 12 }}>{tx.beforeLabel}</p>
            {tx.beforeItems.map(t => (
              <p key={t} style={S.compareRow}>
                <span style={{ color: '#ef4444', flexShrink: 0 }}>✗</span>
                {t}
              </p>
            ))}
          </div>
          <div style={S.compareAfter}>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#86efac', marginBottom: 12 }}>{tx.afterLabel}</p>
            {tx.afterItems.map(t => (
              <p key={t} style={S.compareRow}>
                <span style={{ color: '#86efac', flexShrink: 0 }}>✓</span>
                {t}
              </p>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Calculator */}
      <motion.div style={S.glass} {...fy(0)} onViewportEnter={handleViewportEnter}>
        <p style={S.sectionLabel}>{tx.calcLabel}</p>
        <h2 style={S.sectionH2}>{tx.calcTitle}</h2>
        <p style={{ color: '#8892a4', fontSize: 13, marginBottom: 24 }}>{tx.calcNote}</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: '#8892a4' }}>{tx.calcObjectsLabel}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#e8eaf0' }}>{objects}</span>
        </div>
        <input
          type="range" min={1} max={20} value={objects}
          onChange={e => handleSlider(parseInt(e.target.value))}
          style={S.slider}
        />

        <motion.div
          key={pulseKey}
          className="lead-calc-grid"
          style={S.calcGrid}
          animate={pulseKey > 0 && !reduced ? { scale: [1, 1.018, 1] } : {}}
          transition={{ duration: 0.22 }}
        >
          <div style={S.calcBox}>
            <span style={S.calcNum}><Counter mv={cleaningsMV} /></span>
            <span style={S.calcSub}>{tx.calcSubs[0]}</span>
          </div>
          <div style={S.calcBox}>
            <span style={S.calcNum}>
              <Counter
                mv={hoursMV}
                fmt={v => {
                  const r = Math.round(v * 10) / 10
                  return (r % 1 === 0 ? Math.round(r) : r.toFixed(1)) + 'h'
                }}
              />
            </span>
            <span style={S.calcSub}>{tx.calcSubs[1]}</span>
          </div>
          <div style={S.calcBox}>
            <span style={{ ...S.calcNum, color: '#86efac' }}>
              <Counter mv={savingsMV} fmt={v => Math.round(v) + ' €'} />
            </span>
            <span style={S.calcSub}>{tx.calcSubs[2]}</span>
          </div>
        </motion.div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#8892a4', marginTop: 16 }}>
          {tx.calcYearPre}{' '}
          <strong style={{ color: '#e8eaf0' }}>
            {(savingsNow * 12).toLocaleString(tx.calcLocale)}
          </strong>{' '}
          {tx.calcYearPost}
        </p>

        {/* Loss-aversion block */}
        <div style={S.chaosBlock}>
          <p style={S.chaosTitle}>{tx.calcRiskTitle}</p>
          {tx.calcRisks.map(text => (
            <p key={text} style={S.chaosRow}>
              <span style={{ flexShrink: 0, opacity: 0.5 }}>·</span>
              {text}
            </p>
          ))}
          <p style={S.calcBridge}>{tx.calcBridge}</p>
          <button
            style={S.softCta}
            onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="lead-soft-cta"
          >
            {tx.calcCta}
          </button>
        </div>
      </motion.div>

      {/* Garantie */}
      <motion.div style={{ ...S.glass, textAlign: 'center', padding: '36px 28px' }} {...fy(0)}>
        <motion.svg
          width="52" height="52" viewBox="0 0 24 24"
          fill="none" strokeLinecap="round" strokeLinejoin="round"
          style={{ display: 'block', margin: '0 auto 18px' }}
          aria-hidden="true"
        >
          <motion.path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke="#3b7ef8" strokeWidth="1.5" fill="none"
            {...(reduced ? {} : {
              initial:     { pathLength: 0, opacity: 0 },
              whileInView: { pathLength: 1, opacity: 1 },
              viewport:    VP,
              transition:  { duration: 1.1, ease: 'easeOut', delay: 0.1 },
            })}
          />
          <motion.polyline
            points="9 12 11 14 15 10"
            stroke="#86efac" strokeWidth="2" fill="none"
            {...(reduced ? {} : {
              initial:     { pathLength: 0, opacity: 0 },
              whileInView: { pathLength: 1, opacity: 1 },
              viewport:    VP,
              transition:  { duration: 0.4, ease: 'easeOut', delay: 1.0 },
            })}
          />
        </motion.svg>
        <h2 style={{ color: '#e8eaf0', fontSize: 19, fontWeight: 700, marginBottom: 10 }}>
          {tx.garantieTitle}
        </h2>
        <p style={{ color: '#8892a4', fontSize: 14, lineHeight: 1.7, maxWidth: 400, margin: '0 auto' }}>
          {tx.garantieDesc}
        </p>
      </motion.div>

      {/* How-it-works */}
      <div>
        <motion.div style={{ textAlign: 'center', marginBottom: 20 }} {...fy(0)}>
          <p style={S.sectionLabel}>{tx.howLabel}</p>
          <h2 style={S.sectionH2}>{tx.howTitle}</h2>
        </motion.div>
        <div className="lead-steps-grid" style={S.stepsGrid}>
          {tx.steps.map((step, i) => (
            <motion.div
              key={step.title}
              style={{ ...S.glass, padding: '20px 18px' }}
              initial={reduced ? {} : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VP}
              transition={{ ...SPRING, delay: i * 0.07 }}
            >
              <div style={{ fontSize: 26, marginBottom: 10 }}>{step.icon}</div>
              <p style={{ fontWeight: 600, color: '#e8eaf0', fontSize: 14, marginBottom: 6 }}>{step.title}</p>
              <p style={{ color: '#8892a4', fontSize: 12.5, lineHeight: 1.6 }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Reviews — real quotes kept as-is, only section labels localized */}
      <div>
        <motion.div style={{ textAlign: 'center', marginBottom: 20 }} {...fy(0)}>
          <p style={S.sectionLabel}>{tx.reviewsLabel}</p>
          <h2 style={S.sectionH2}>{tx.reviewsTitle}</h2>
          <p style={S.reviewsNote}>{tx.reviewsNote}</p>
        </motion.div>
        <div className="lead-reviews-grid" style={S.reviewsGrid}>
          {REVIEWS.map((review, i) => (
            <motion.div
              key={i}
              style={{ ...S.glass, padding: '20px 18px' }}
              initial={reduced ? {} : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VP}
              transition={{ ...SPRING, delay: i * 0.07 }}
            >
              <p style={S.reviewText}>„{review.text}"</p>
              <p style={S.reviewAuthor}>{review.author ? `— ${review.author}, Wien` : '— Wien'}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <motion.div style={{ textAlign: 'center', marginBottom: 20 }} {...fy(0)}>
          <p style={S.sectionLabel}>{tx.faqLabel}</p>
          <h2 style={S.sectionH2}>{tx.faqTitle}</h2>
        </motion.div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tx.faqs.map((faq, i) => (
            <motion.div
              key={i}
              style={{ ...S.glass, padding: 0, overflow: 'hidden' }}
              initial={reduced ? {} : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VP}
              transition={{ ...SPRING, delay: i * 0.05 }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={S.faqBtn}
                aria-expanded={openFaq === i}
              >
                <span style={{ textAlign: 'left', color: '#e8eaf0', fontSize: 14, fontWeight: 500 }}>
                  {faq.q}
                </span>
                <motion.span
                  animate={{ rotate: openFaq === i ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ color: '#8892a4', fontSize: 20, flexShrink: 0, display: 'block', lineHeight: 1 }}
                >+</motion.span>
              </button>
              <AnimatePresence initial={false}>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p style={{ padding: '0 20px 18px', color: '#8892a4', fontSize: 13, lineHeight: 1.7 }}>
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Guide opt-in form */}
      <motion.div ref={formRef} style={S.glass} {...fy(0)}>
        <div style={S.guideOffer}>
          <p style={S.guideBadge}>{tx.guideBadgeText}</p>
          <h2 style={{ fontSize: 19, fontWeight: 700, color: '#e8eaf0', margin: '6px 0 10px' }}>
            {tx.guideTitle}
          </h2>
          <p style={S.guideOfferDesc}>{tx.guideDesc}</p>
          <p style={{ fontSize: 13, color: '#4a5568', marginTop: 10 }}>{tx.guideHint}</p>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', margin: '20px 0' }} />
        <form onSubmit={handleSubmit} style={S.form} noValidate>
          <div style={S.fieldGroup}>
            <label style={S.fieldLabel} htmlFor="name">{tx.formNameLabel}</label>
            <input
              id="name" name="name" type="text"
              placeholder={tx.formNamePlaceholder}
              value={form.name} onChange={handleChange} required
              className="lead-input" style={S.input}
            />
          </div>
          <div className="lead-field-row" style={S.fieldRow}>
            <div style={S.fieldGroup}>
              <label style={S.fieldLabel} htmlFor="email">{tx.formEmailLabel}</label>
              <input
                id="email" name="email" type="email" autoComplete="email"
                placeholder={tx.formEmailPlaceholder}
                value={form.email} onChange={handleChange} required
                className="lead-input" style={S.input}
              />
            </div>
            <div style={S.fieldGroup}>
              <label style={S.fieldLabel} htmlFor="phone">{tx.formPhoneLabel}</label>
              <input
                id="phone" name="phone" type="tel"
                placeholder={tx.formPhonePlaceholder}
                value={form.phone} onChange={handleChange} required
                className="lead-input" style={S.input}
              />
            </div>
          </div>
          <div style={S.fieldGroup}>
            <label style={S.fieldLabel} htmlFor="properties">{tx.formPropertiesLabel}</label>
            <select
              id="properties" name="properties"
              value={form.properties} onChange={handleChange} required
              className="lead-input" style={{ ...S.input, cursor: 'pointer' }}
            >
              <option value="" disabled>{tx.formPropertiesDefault}</option>
              {tx.formPropertiesOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div style={S.fieldGroup}>
            <label style={S.fieldLabel} htmlFor="message">
              {tx.formMessageLabel}{' '}
              <span style={{ color: '#4a5568', fontWeight: 400 }}>{tx.formMessageOptional}</span>
            </label>
            <textarea
              id="message" name="message" rows={3}
              placeholder={tx.formMessagePlaceholder}
              value={form.message} onChange={handleChange}
              className="lead-input" style={{ ...S.input, resize: 'vertical', minHeight: 72 }}
            />
          </div>

          {formState === 'error' && (
            <p style={S.formError}>{tx.formError}</p>
          )}

          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={t => setTurnstileToken(t)}
            options={{ theme: 'dark' }}
          />

          <button
            type="submit"
            disabled={formState === 'loading' || !turnstileToken}
            className="lead-submit"
            style={{
              ...S.submitBtn,
              opacity: formState === 'loading' || !turnstileToken ? 0.6 : 1,
              cursor:  formState === 'loading' || !turnstileToken ? 'not-allowed' : 'pointer',
            }}
          >
            {formState === 'loading'
              ? <><span style={S.spinner} />{tx.formSending}</>
              : tx.formSubmit
            }
          </button>
        </form>

        {/* Telegram alternative */}
        <div style={S.tgAlt}>
          <span>{tx.tgAlt}</span>
          <a
            href="https://t.me/Reinraumat"
            target="_blank" rel="noopener noreferrer"
            className="lead-tglink"
            style={S.tgLink}
          >
            <TgIcon />
            @Reinraumat
          </a>
        </div>
      </motion.div>

      {/* Free-tier offer — UI only; button links to /register once built.
          Free: 1 property, Telegram bot, iCal sync.
          Paid: Reinraum dispatch, PDF cleaning reports. */}
      <motion.div style={S.freeTier} {...fy(0)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={S.freeBadge}>{tx.freeBadgeText}</span>
          <span style={{ fontSize: 13, color: '#4a5568' }}>{tx.freeTagline}</span>
        </div>
        <h2 style={{ fontSize: 19, fontWeight: 700, color: '#e8eaf0', marginBottom: 16 }}>
          {tx.freeTitle}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
          {tx.freeItems.map(item => (
            <div key={item} style={S.freeItem}>
              <span style={{ color: '#86efac', flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: 13.5, color: '#e8eaf0' }}>{item}</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, marginBottom: 20 }}>
          <p style={{ fontSize: 11, color: '#4a5568', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 8 }}>
            {tx.freeLater}
          </p>
          {tx.freePaid.map(item => (
            <div key={item} style={{ ...S.freeItem, opacity: 0.45, marginBottom: 7 }}>
              <span style={{ color: '#8892a4', flexShrink: 0, fontSize: 13 }}>+</span>
              <span style={{ fontSize: 13, color: '#8892a4' }}>{item}</span>
            </div>
          ))}
        </div>
        {/* TODO: href="/register" once registration is built */}
        <button
          style={S.freeBtn}
          className="lead-free-btn"
          onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          {tx.freeBtn}
        </button>
      </motion.div>

      {/* Trust strip */}
      <motion.div className="lead-trust-row" style={S.trustRow} {...fy(0)}>
        {tx.trustItems.map(([icon, text]) => (
          <div key={text} style={S.trustItem}>
            <span style={{ fontSize: 14 }}>{icon}</span>
            <span style={{ fontSize: 12, color: '#4a5568' }}>{text}</span>
          </div>
        ))}
      </motion.div>

      <style>{css}</style>
    </main>
  )
}

// ── Styles ────────────────────────────────────────────────────────
const glass = {
  background:           'rgba(255,255,255,0.045)',
  backdropFilter:       'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border:               '1px solid rgba(255,255,255,0.08)',
  borderRadius:         16,
  padding:              24,
} as const

const S = {
  wrap: {
    minHeight:     '100vh',
    maxWidth:      680,
    margin:        '0 auto',
    padding:       '24px 16px 80px',
    display:       'flex',
    flexDirection: 'column' as const,
    gap:           24,
    color:         '#e8eaf0',
  },
  glass,
  header: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    flexWrap:       'wrap' as const,
    gap:            8,
  },
  logo:  { display: 'flex', alignItems: 'center', gap: 8 },
  badge: {
    fontSize:     12,
    fontWeight:   600,
    color:        '#3b7ef8',
    background:   'rgba(59,126,248,0.12)',
    border:       '1px solid rgba(59,126,248,0.25)',
    padding:      '4px 10px',
    borderRadius: 20,
  },
  langToggle: {
    display:      'flex',
    alignItems:   'center',
    background:   'rgba(255,255,255,0.05)',
    border:       '1px solid rgba(255,255,255,0.10)',
    borderRadius: 8,
    overflow:     'hidden',
  },
  langBtn: {
    padding:    '4px 10px',
    fontSize:   12,
    fontWeight: 600,
    color:      '#4a5568',
    background: 'none',
    border:     'none',
    cursor:     'pointer',
    fontFamily: 'inherit',
    transition: 'color 0.12s, background 0.12s',
  } as React.CSSProperties,
  langBtnActive: {
    color:      '#e8eaf0',
    background: 'rgba(59,126,248,0.22)',
  } as React.CSSProperties,
  h1: {
    fontSize:      'clamp(26px, 6vw, 38px)',
    fontWeight:    800,
    lineHeight:    1.2,
    letterSpacing: '-0.5px',
    marginBottom:  14,
  },
  sub: {
    fontSize:   15,
    color:      '#8892a4',
    lineHeight: 1.65,
    maxWidth:   480,
  },
  ctaBtn: {
    padding:      '14px 28px',
    background:   '#3b7ef8',
    color:        '#fff',
    border:       'none',
    borderRadius: 12,
    fontSize:     15,
    fontWeight:   700,
    cursor:       'pointer',
    fontFamily:   'inherit',
    transition:   'opacity 0.15s',
  } as React.CSSProperties,
  sectionLabel: {
    fontSize:      11,
    fontWeight:    600,
    color:         '#3b7ef8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    marginBottom:  6,
  },
  sectionH2: {
    fontSize:     20,
    fontWeight:   700,
    color:        '#e8eaf0',
    marginBottom: 20,
  },
  bubble: {
    maxWidth:      '76%',
    padding:       '10px 14px',
    display:       'flex',
    flexDirection: 'column' as const,
    gap:           3,
  },
  bubbleBot: {
    alignSelf:    'flex-start' as const,
    background:   'rgba(59,126,248,0.13)',
    border:       '1px solid rgba(59,126,248,0.2)',
    color:        '#e8eaf0',
    borderRadius: '4px 12px 12px 12px',
  },
  bubbleUser: {
    alignSelf:    'flex-end' as const,
    background:   'rgba(21,128,61,0.18)',
    border:       '1px solid rgba(134,239,172,0.18)',
    color:        '#86efac',
    borderRadius: '12px 4px 12px 12px',
  },
  bubbleHost: {
    alignSelf:    'flex-end' as const,
    background:   'rgba(255,255,255,0.05)',
    border:       '1px solid rgba(255,255,255,0.09)',
    color:        '#8892a4',
    borderRadius: '12px 4px 12px 12px',
    fontSize:     12,
  },
  bubbleLabel: {
    fontSize:      10,
    fontWeight:    600,
    color:         '#4a5568',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  compareGrid: {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:                 12,
  },
  compareBefore: {
    background:   'rgba(239,68,68,0.06)',
    border:       '1px solid rgba(239,68,68,0.15)',
    borderRadius: 12,
    padding:      16,
  },
  compareAfter: {
    background:   'rgba(21,128,61,0.06)',
    border:       '1px solid rgba(134,239,172,0.15)',
    borderRadius: 12,
    padding:      16,
  },
  compareRow: {
    fontSize:     12.5,
    color:        '#8892a4',
    marginBottom: 8,
    display:      'flex',
    gap:          8,
    alignItems:   'flex-start' as const,
    lineHeight:   1.45,
  },
  slider: {
    width:        '100%',
    accentColor:  '#3b7ef8',
    marginBottom: 24,
    cursor:       'pointer',
    display:      'block',
    height:       4,
  } as React.CSSProperties,
  calcGrid: {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap:                 10,
  },
  calcBox: {
    background:    'rgba(255,255,255,0.04)',
    border:        '1px solid rgba(255,255,255,0.07)',
    borderRadius:  10,
    padding:       '14px 10px',
    textAlign:     'center' as const,
    display:       'flex',
    flexDirection: 'column' as const,
    gap:           4,
  },
  calcNum: {
    fontSize:   24,
    fontWeight: 800,
    color:      '#e8eaf0',
    display:    'block',
  },
  calcSub: {
    fontSize:   11,
    color:      '#4a5568',
    lineHeight: 1.4,
    display:    'block',
  },
  stepsGrid: {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:                 12,
  },
  faqBtn: {
    width:          '100%',
    background:     'none',
    border:         'none',
    padding:        '16px 20px',
    display:        'flex',
    justifyContent: 'space-between' as const,
    alignItems:     'center',
    gap:            16,
    cursor:         'pointer',
    fontFamily:     'inherit',
    textAlign:      'left' as const,
  },
  form: {
    display:       'flex',
    flexDirection: 'column' as const,
    gap:           16,
  },
  fieldGroup: {
    display:       'flex',
    flexDirection: 'column' as const,
    gap:           6,
    flex:          1,
  },
  fieldRow: {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:                 12,
  },
  fieldLabel: {
    fontSize:   13,
    fontWeight: 600,
    color:      '#8892a4',
  },
  input: {
    width:        '100%',
    padding:      '10px 14px',
    border:       '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    fontSize:     14,
    color:        '#e8eaf0',
    background:   'rgba(255,255,255,0.05)',
    outline:      'none',
    fontFamily:   'inherit',
    transition:   'border-color 0.15s, box-shadow 0.15s',
  } as React.CSSProperties,
  formError: {
    fontSize:     13,
    color:        '#fca5a5',
    background:   'rgba(239,68,68,0.1)',
    border:       '1px solid rgba(239,68,68,0.28)',
    padding:      '8px 12px',
    borderRadius: 8,
  },
  submitBtn: {
    width:          '100%',
    padding:        14,
    background:     '#3b7ef8',
    color:          '#fff',
    border:         'none',
    borderRadius:   12,
    fontSize:       15,
    fontWeight:     700,
    fontFamily:     'inherit',
    transition:     'opacity 0.15s',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            8,
  } as React.CSSProperties,
  spinner: {
    width:          16,
    height:         16,
    border:         '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius:   '50%',
    animation:      'cs-spin 0.8s linear infinite',
    display:        'inline-block',
    flexShrink:     0,
  } as React.CSSProperties,
  tgAlt: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            10,
    marginTop:      20,
    fontSize:       13,
    color:          '#4a5568',
    flexWrap:       'wrap' as const,
  },
  tgLink: {
    display:        'inline-flex',
    alignItems:     'center',
    gap:            6,
    color:          '#3b7ef8',
    fontWeight:     600,
    textDecoration: 'none',
  } as React.CSSProperties,
  successIcon: {
    width:          52,
    height:         52,
    borderRadius:   '50%',
    background:     'rgba(21,128,61,0.18)',
    border:         '1px solid rgba(134,239,172,0.25)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    margin:         '0 auto 20px',
    fontSize:       26,
    color:          '#86efac',
  },
  trustRow: {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:                 10,
    paddingBottom:       8,
  },
  trustItem: {
    display:    'flex',
    alignItems: 'center',
    gap:        8,
  },
  trustBarGrid: {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap:                 8,
    padding:             '14px 18px',
    background:          'rgba(255,255,255,0.03)',
    border:              '1px solid rgba(255,255,255,0.07)',
    borderRadius:        12,
  },
  trustBarItem: {
    fontSize:   12.5,
    color:      '#8892a4',
    fontWeight: 500,
    lineHeight: 1.4,
    textAlign:  'center' as const,
  },
  chaosBlock: {
    marginTop:  20,
    paddingTop: 16,
    borderTop:  '1px solid rgba(255,255,255,0.07)',
  },
  chaosTitle: {
    fontSize:      11,
    fontWeight:    600,
    color:         '#8892a4',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom:  10,
  },
  chaosRow: {
    fontSize:     13,
    color:        'rgba(255,255,255,0.50)' as const,
    marginBottom: 6,
    display:      'flex',
    gap:          8,
    alignItems:   'flex-start' as const,
    lineHeight:   1.5,
  },
  calcBridge: {
    marginTop:  14,
    fontSize:   13,
    color:      '#8892a4',
    lineHeight: 1.65,
  },
  softCta: {
    marginTop:    14,
    padding:      '10px 20px',
    background:   'rgba(59,126,248,0.10)',
    border:       '1px solid rgba(59,126,248,0.22)',
    borderRadius: 10,
    color:        '#3b7ef8',
    fontSize:     13,
    fontWeight:   600,
    cursor:       'pointer',
    fontFamily:   'inherit',
    transition:   'opacity 0.15s',
    display:      'block',
  } as React.CSSProperties,
  freeTier: {
    background:   'rgba(21,128,61,0.06)',
    border:       '1px solid rgba(134,239,172,0.15)',
    borderRadius: 16,
    padding:      24,
  },
  freeBadge: {
    fontSize:      11,
    fontWeight:    700,
    color:         '#86efac',
    background:    'rgba(21,128,61,0.18)',
    border:        '1px solid rgba(134,239,172,0.25)',
    padding:       '3px 10px',
    borderRadius:  20,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.07em',
  },
  freeItem: {
    display:    'flex',
    alignItems: 'center' as const,
    gap:        10,
  },
  freeBtn: {
    width:        '100%',
    padding:      14,
    background:   'rgba(21,128,61,0.18)',
    border:       '1px solid rgba(134,239,172,0.28)',
    borderRadius: 12,
    color:        '#86efac',
    fontSize:     15,
    fontWeight:   700,
    cursor:       'pointer',
    fontFamily:   'inherit',
    transition:   'opacity 0.15s',
  } as React.CSSProperties,
  guideOffer: {
    background:   'rgba(59,126,248,0.05)',
    border:       '1px solid rgba(59,126,248,0.14)',
    borderRadius: 10,
    padding:      '16px 18px',
  },
  guideBadge: {
    display:       'inline-block',
    fontSize:      11,
    fontWeight:    700,
    color:         '#3b7ef8',
    background:    'rgba(59,126,248,0.12)',
    border:        '1px solid rgba(59,126,248,0.22)',
    padding:       '3px 10px',
    borderRadius:  20,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.07em',
    marginBottom:  0,
  },
  guideOfferDesc: {
    fontSize:   13.5,
    color:      '#8892a4',
    lineHeight: 1.65,
  },
  guideDownloadBtn: {
    display:        'inline-block',
    padding:        '12px 24px',
    background:     '#3b7ef8',
    color:          '#fff',
    fontWeight:     700,
    fontSize:       14,
    borderRadius:   10,
    textDecoration: 'none',
    transition:     'opacity 0.15s',
  } as React.CSSProperties,
  reviewsNote: {
    fontSize:  12,
    color:     '#4a5568',
    marginTop: -12,
  },
  reviewsGrid: {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:                 12,
  },
  reviewText: {
    fontSize:     13,
    color:        '#8892a4',
    lineHeight:   1.65,
    marginBottom: 12,
    fontStyle:    'italic' as const,
  },
  reviewAuthor: {
    fontSize:   12,
    color:      '#4a5568',
    fontWeight: 500,
  },
}

const css = `
  .lead-input:focus {
    border-color: #3b7ef8 !important;
    box-shadow: 0 0 0 3px rgba(59,126,248,0.15) !important;
    background: rgba(255,255,255,0.07) !important;
  }
  .lead-input::placeholder { color: #4a5568; }
  .lead-input option { background: #161c28; color: #e8eaf0; }
  .lead-cta:hover    { opacity: 0.85; }
  .lead-submit:hover:not(:disabled) { opacity: 0.88; }
  .lead-tglink:hover { text-decoration: underline; }
  .lead-soft-cta:hover  { opacity: 0.80; }
  .lead-guide-dl:hover  { opacity: 0.85; }
  .lead-free-btn:hover  { opacity: 0.82; }
  .lead-lang-btn:hover  { color: #8892a4; }
  @keyframes cs-spin { to { transform: rotate(360deg); } }
  @media (max-width: 600px) {
    .lead-trust-bar    { grid-template-columns: 1fr 1fr !important; }
    .lead-reviews-grid { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 480px) {
    .lead-field-row    { grid-template-columns: 1fr !important; }
    .lead-compare-grid { grid-template-columns: 1fr !important; }
    .lead-steps-grid   { grid-template-columns: 1fr !important; }
    .lead-trust-row    { grid-template-columns: 1fr !important; }
    .lead-calc-grid    { grid-template-columns: 1fr !important; }
    .lead-trust-bar    { grid-template-columns: 1fr 1fr !important; }
    .lead-reviews-grid { grid-template-columns: 1fr !important; }
  }
`
