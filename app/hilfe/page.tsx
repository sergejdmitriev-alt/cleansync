'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Header from '@/app/components/Header'

interface AccordionItem {
  q: string
  a: string | React.ReactNode
}

interface Category {
  id:     string
  icon:   React.ReactNode
  title:  string
  items:  AccordionItem[]
  extra?: React.ReactNode
}

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const CalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
)
const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const HelpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

const CATEGORIES: Category[] = [
  {
    id: 'erste-schritte',
    icon: <HomeIcon />,
    title: 'Erste Schritte',
    items: [
      {
        q: 'Was ist CleanSync?',
        a: 'CleanSync ist ein Reinigungsmanagement-Tool für Kurzzeitvermieter (Airbnb, Booking.com & Co.). Sie erstellen Reinigungsaufträge, senden sie an Ihre Reinigungskräfte per Telegram und erhalten automatisch Benachrichtigungen, wenn ein Auftrag angenommen oder abgeschlossen wird.',
      },
      {
        q: 'Wie erstelle ich meinen ersten Auftrag?',
        a: 'Klicken Sie oben rechts auf „+ Neuer Auftrag". Wählen Sie das Objekt, die Reinigungskraft und die Abreise-/Anreisezeiten. Mit „Speichern & Senden" wird der Auftrag sofort per Telegram an die Reinigungskraft gesendet.',
      },
      {
        q: 'Welche Auftragsstatusarten gibt es?',
        a: 'Ausstehend → Gesendet → Angenommen → Erledigt. Abgelehnte oder archivierte Aufträge werden separat angezeigt. Im Archiv finden Sie alle abgeschlossenen Aufträge.',
      },
    ],
  },
  {
    id: 'unterkuenfte',
    icon: <CalIcon />,
    title: 'Unterkünfte & iCal',
    items: [
      {
        q: 'Wie füge ich eine Unterkunft hinzu?',
        a: 'Gehen Sie zu Einstellungen → Objekte → geben Sie Name und Adresse ein → klicken Sie „+ Hinzufügen". Optional können Sie eine Notizvorlage hinterlegen, die bei jedem neuen Auftrag automatisch vorausgefüllt wird.',
      },
      {
        q: 'Wie verbinde ich den Airbnb-Kalender (iCal)?',
        a: 'In Airbnb: Kalender → Verfügbarkeit exportieren → iCal-Link kopieren. In CleanSync: Einstellungen → Objekte → Bearbeiten → Airbnb iCal URL einfügen → Speichern. Aufträge werden dann automatisch beim Sync erstellt.',
      },
      {
        q: 'Wie synchronisiere ich manuell?',
        a: 'In Einstellungen → Objekte klicken Sie auf den „🔄 Sync"-Button neben dem gewünschten Objekt. Es werden neue Aufträge aus dem iCal-Kalender importiert, bestehende werden nicht verändert.',
      },
    ],
  },
  {
    id: 'auftraege',
    icon: <FileIcon />,
    title: 'Aufträge',
    items: [
      {
        q: 'Wie sende ich einen gespeicherten Auftrag?',
        a: 'Öffnen Sie den Auftrag → klicken Sie „📤 Senden". Der Auftrag wechselt von „Ausstehend" zu „Gesendet" und die Reinigungskraft erhält eine Telegram-Nachricht mit Akzeptieren/Ablehnen-Buttons.',
      },
      {
        q: 'Kann ich Reinraum als Reinigungsdienst beauftragen?',
        a: 'Ja. Beim Erstellen eines Auftrags wählen Sie den Tab „Reinraum" statt „Eigene Reinigungskraft". Der Auftrag wird direkt an Reinraum weitergeleitet und Sie erhalten eine Bestätigung.',
      },
      {
        q: 'Wie archiviere ich erledigte Aufträge?',
        a: 'Öffnen Sie den Auftrag → klicken Sie „Archivieren". Archivierte Aufträge erscheinen nicht mehr in der Hauptliste, sind aber unter „Archiv" im Menü weiterhin einsehbar.',
      },
    ],
  },
  {
    id: 'reinigungskraefte',
    icon: <UsersIcon />,
    title: 'Reinigungskräfte',
    items: [
      {
        q: 'Wie füge ich eine Reinigungskraft hinzu?',
        a: 'Einstellungen → Reinigungskräfte → Name und Telegram Chat ID eingeben → „+ Hinzufügen". Die Chat ID erhält die Reinigungskraft, indem sie @userinfobot in Telegram öffnet und „/start" sendet.',
      },
      {
        q: 'Welche Sprachen werden unterstützt?',
        a: 'Deutsch, Russisch, Ukrainisch, Rumänisch und Polnisch. Die Reinigungskraft wählt ihre Sprache selbst beim ersten Start des Telegram-Bots. Die Auftragsdetails werden dann in der gewählten Sprache zugestellt.',
      },
      {
        q: 'Was passiert, wenn eine Reinigungskraft ablehnt?',
        a: 'Das System fragt automatisch die nächste Reinigungskraft in der festgelegten Reihenfolge (Reinigungs-Garantie). Sind alle nicht verfügbar, erhalten Sie eine Benachrichtigung mit der Option, den Auftrag an Reinraum zu übergeben — mit einem Klick.',
      },
      {
        q: 'Was ist die Reinigungs-Garantie und wie richte ich sie ein?',
        a: 'Unter Einstellungen → Objekte → „⬆ Reihenfolge" legen Sie fest, welche Reinigungskraft zuerst gefragt wird. Sagt sie ab, übernimmt automatisch die nächste — und im Notfall Reinraum. So ist jede Reinigung abgesichert.',
      },
    ],
  },
  {
    id: 'telegram',
    icon: <SendIcon />,
    title: 'Telegram-Bot',
    items: [
      {
        q: 'Wie verbinde ich Telegram für Host-Benachrichtigungen?',
        a: (
          <span>
            Option 1: Gehen Sie zu{' '}
            <Link href="/connect-telegram" style={{ color: 'var(--cs-blue)', textDecoration: 'none' }}>Telegram verbinden</Link>
            {' '}und öffnen Sie den generierten Link — der Bot verbindet sich automatisch.{' '}
            Option 2: Öffnen Sie <a href="https://t.me/cleansync_bot" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cs-blue)', textDecoration: 'none' }}>@cleansync_bot</a>,
            {' '}senden Sie <code>/start</code> — der Bot zeigt Ihre ID. Tragen Sie diese in Einstellungen → Telegram ein.
          </span>
        ),
      },
      {
        q: 'Was erhält die Reinigungskraft per Telegram?',
        a: 'Die Reinigungskraft erhält Auftragsdetails (Objekt, Abreise-/Anreisezeit, Notizen) mit zwei Buttons: „Annehmen" und „Ablehnen". Nach Abschluss kann sie Fotos hochladen und den Auftrag als erledigt markieren.',
      },
      {
        q: 'Was erhalte ich als Host?',
        a: 'Sie erhalten eine Telegram-Nachricht wenn ein Auftrag angenommen wird (✅ Auftrag angenommen) und wenn die Reinigung abgeschlossen ist (🏁 Reinigung abgeschlossen) — mit Anzahl der Fotos und direktem Link zum Auftrag.',
      },
    ],
    extra: (
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--cs-border)' }}>
        <Link
          href="/connect-telegram"
          className="cs-btn-primary"
          style={{ textDecoration: 'none', display: 'inline-flex', fontSize: '13px' }}
        >
          Telegram verbinden
        </Link>
      </div>
    ),
  },
  {
    id: 'faq',
    icon: <HelpIcon />,
    title: 'FAQ',
    items: [
      {
        q: 'Der Bot antwortet nicht auf meine Reinigungskraft. Was tun?',
        a: 'Prüfen Sie in Einstellungen → Reinigungskräfte, ob die Telegram Chat ID korrekt eingetragen ist. Die Chat ID erhalten Sie über @userinfobot in Telegram. Nach einer Änderung muss der nächste Auftrag neu gesendet werden.',
      },
      {
        q: 'iCal-Sync erstellt keine Aufträge. Was tun?',
        a: 'Stellen Sie sicher, dass die iCal-URL direkt von Airbnb stammt (Format: airbnb.com/calendar/ical/…). Prüfen Sie, ob die Buchungen in der Zukunft liegen und keine Lücken zwischen Abreise und Anreise haben.',
      },
      {
        q: 'Kann ich mehrere Objekte und Reinigungskräfte verwenden?',
        a: 'Ja. Es gibt keine Begrenzung für die Anzahl der Objekte oder Reinigungskräfte. Jeder Auftrag wird einem bestimmten Objekt und einer Reinigungskraft zugewiesen.',
      },
      {
        q: 'Wie exportiere ich Aufträge?',
        a: 'In der Auftragsansicht oder im Archiv finden Sie den „Export" bzw. „PDF"-Button. Damit exportieren Sie eine Übersicht Ihrer Aufträge als PDF für Buchhaltung oder Reporting.',
      },
    ],
  },
]

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <motion.svg
      width="16" height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      style={{ flexShrink: 0 }}
    >
      <polyline points="6 9 12 15 18 9"/>
    </motion.svg>
  )
}

export default function HilfePage() {
  const [openId, setOpenId] = useState<string | null>(null)
  const reduced = useReducedMotion()

  const toggle = (id: string) => setOpenId(prev => prev === id ? null : id)

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 20px' }}>

        <h1 style={{
          fontSize:      '22px',
          fontWeight:    '600',
          color:         'var(--cs-text-1)',
          margin:        '0 0 24px',
          letterSpacing: '-0.02em',
        }}>
          Hilfe & Anleitungen
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Tour replay */}
          <motion.div
            className="cs-card"
            initial={reduced ? {} : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('cs:onboarding-replay'))}
              style={{
                width:       '100%',
                display:     'flex',
                alignItems:  'center',
                gap:         '10px',
                padding:     '14px 16px',
                background:  'none',
                border:      'none',
                cursor:      'pointer',
                color:       'var(--cs-text-1)',
                textAlign:   'left',
              }}
            >
              <span style={{ color: 'var(--cs-blue)', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
              </span>
              <span style={{ flex: 1, fontSize: '15px', fontWeight: '600' }}>Tour erneut ansehen</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--cs-text-3)' }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </motion.div>

          {CATEGORIES.map((cat, ci) => {
            const isOpen = openId === cat.id
            return (
              <motion.div
                key={cat.id}
                className="cs-card"
                style={{ overflow: 'hidden' }}
                initial={reduced ? {} : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: ci * 0.05,
                  type:  'spring',
                  stiffness: 300,
                  damping:   28,
                }}
                whileHover={reduced ? {} : { y: -2 }}
              >
                {/* Заголовок категории */}
                <button
                  onClick={() => toggle(cat.id)}
                  style={{
                    width:          '100%',
                    display:        'flex',
                    alignItems:     'center',
                    gap:            '10px',
                    padding:        '14px 16px',
                    background:     'none',
                    border:         'none',
                    cursor:         'pointer',
                    color:          'var(--cs-text-1)',
                    textAlign:      'left',
                  }}
                >
                  <span style={{ color: 'var(--cs-blue)', flexShrink: 0 }}>{cat.icon}</span>
                  <span style={{ flex: 1, fontSize: '15px', fontWeight: '600' }}>{cat.title}</span>
                  <ChevronIcon open={isOpen} />
                </button>

                {/* Аккордеон */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ borderTop: '1px solid var(--cs-border)' }}>
                        {cat.items.map((item, ii) => (
                          <AccordionItem key={ii} item={item} isLast={ii === cat.items.length - 1} />
                        ))}
                        {'extra' in cat && cat.extra}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

function AccordionItem({ item, isLast }: { item: AccordionItem; isLast: boolean }) {
  const [open, setOpen] = useState(false)
  const reduced = useReducedMotion()

  return (
    <div style={{ borderBottom: isLast ? 'none' : '1px solid var(--cs-border)' }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          width:       '100%',
          display:     'flex',
          alignItems:  'flex-start',
          gap:         '10px',
          padding:     '12px 16px',
          background:  'none',
          border:      'none',
          cursor:      'pointer',
          color:       'var(--cs-text-1)',
          textAlign:   'left',
        }}
      >
        <span style={{ flex: 1, fontSize: '13px', fontWeight: '500', paddingTop: '1px' }}>
          {item.q}
        </span>
        <motion.svg
          width="14" height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          style={{ flexShrink: 0, marginTop: '2px', color: 'var(--cs-text-3)' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{
              margin:     0,
              padding:    '0 16px 14px',
              fontSize:   '13px',
              lineHeight: '1.65',
              color:      'var(--cs-text-2)',
            }}>
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
