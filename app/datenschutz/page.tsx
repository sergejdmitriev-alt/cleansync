import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Datenschutzerklärung · CleanSync',
  description: 'Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO und österreichischem Datenschutzgesetz (DSG).',
  robots: { index: false, follow: false },
}

// ── Datenschutzerklärung ──────────────────────────────────────────
// Stand: [Datum eintragen, z. B. Jänner 2026]
// TODO vor Veröffentlichung ersetzen:
//   [Firmenname]        – z. B. Reinraum e.U. / GmbH
//   [Firmenbuchnummer]  – FN ......
//   [UID]               – ATU........
//   [Adresse]           – Straße Nr., PLZ Wien
//   [E-Mail]            – datenschutz@cleansync.at o. Ä.
//   [Datum]             – Stand der Erklärung
// Rechtlicher Hinweis: vor Live-Schaltung von einer/einem Jurist:in
// bzw. Datenschutzexpert:in prüfen lassen.

function IconLock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="#3b7ef8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
function IconNoSale() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="#3b7ef8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
function IconNoSpam() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="#3b7ef8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  )
}

export default function DatenschutzPage() {
  return (
    <main style={S.wrap}>
      <a href="/lead" style={S.back}>← Zurück</a>

      <h1 style={S.h1}>Datenschutzerklärung</h1>
      <p style={S.meta}>Stand: [Datum]</p>

      <div style={S.badges}>
        <div style={S.badge}><IconLock /><span style={S.badgeText}>Daten in der EU</span></div>
        <div style={S.badge}><IconNoSale /><span style={S.badgeText}>Kein Datenverkauf</span></div>
        <div style={S.badge}><IconNoSpam /><span style={S.badgeText}>Kein Spam</span></div>
      </div>

      <p style={S.lead}>
        Der Schutz Ihrer personenbezogenen Daten ist uns ein wichtiges Anliegen.
        In dieser Datenschutzerklärung informieren wir Sie gemäß der
        Datenschutz-Grundverordnung (DSGVO) und dem österreichischen
        Datenschutzgesetz (DSG) darüber, welche personenbezogenen Daten wir
        verarbeiten, zu welchem Zweck und auf welcher Rechtsgrundlage dies
        geschieht, sowie über die Ihnen zustehenden Rechte.
      </p>

      {/* 1 — Verantwortlicher */}
      <Section n="1" title="Verantwortlicher">
        <p style={S.p}>
          Verantwortlicher im Sinne der DSGVO ist:
        </p>
        <p style={S.addr}>
          [Firmenname]<br />
          [Adresse]<br />
          Firmenbuchnummer: [Firmenbuchnummer]<br />
          UID: [UID]<br />
          E-Mail: <a href="mailto:[E-Mail]" style={S.link}>[E-Mail]</a>
        </p>
        <p style={S.p}>
          Der Dienst CleanSync (cleansync.at) wird von [Firmenname] betrieben.
          Für alle Fragen zur Verarbeitung Ihrer personenbezogenen Daten können
          Sie sich jederzeit an die oben genannte E-Mail-Adresse wenden.
        </p>
      </Section>

      {/* 2 — Verarbeitung im Rahmen des Kontaktformulars */}
      <Section n="2" title="Verarbeitung über das Anfrage- und Leitfaden-Formular">
        <p style={S.p}>
          Wenn Sie auf unserer Website das Formular zur Anforderung des
          Gratis-Leitfadens ausfüllen, verarbeiten wir die von Ihnen
          eingegebenen Daten, um Ihnen den Leitfaden zuzusenden und Ihre Anfrage
          zu bearbeiten.
        </p>
        <p style={S.p}>Verarbeitete Daten:</p>
        <ul style={S.ul}>
          <li style={S.li}>Name (sofern angegeben)</li>
          <li style={S.li}>E-Mail-Adresse</li>
          <li style={S.li}>Telefonnummer (sofern angegeben)</li>
          <li style={S.li}>Anzahl der Objekte (sofern angegeben)</li>
          <li style={S.li}>Ihre Nachricht (sofern angegeben)</li>
        </ul>
        <p style={S.p}>
          <strong style={S.strong}>Rechtsgrundlage:</strong> Die Verarbeitung
          erfolgt auf Grundlage Ihrer ausdrücklichen Einwilligung gemäß
          Art. 6 Abs. 1 lit. a DSGVO, die Sie durch das Aktivieren des
          Kontrollkästchens vor dem Absenden des Formulars erteilen. Soweit die
          Bearbeitung Ihrer Anfrage der Anbahnung eines Vertragsverhältnisses
          dient, stützt sich die Verarbeitung zusätzlich auf
          Art. 6 Abs. 1 lit. b DSGVO.
        </p>
        <p style={S.p}>
          <strong style={S.strong}>Widerruf:</strong> Sie können Ihre
          Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen, etwa
          durch eine formlose Nachricht an die oben genannte E-Mail-Adresse. Die
          Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung bleibt davon
          unberührt.
        </p>
      </Section>

      {/* 3 — E-Mail-Versand (Resend) */}
      <Section n="3" title="E-Mail-Versand (Resend)">
        <p style={S.p}>
          Für den Versand von E-Mails, insbesondere zur Übermittlung des
          Leitfadens und zur Beantwortung Ihrer Anfrage, setzen wir den Dienst
          Resend (Resend, Inc.) ein. Dabei wird Ihre E-Mail-Adresse an Resend
          übermittelt und dort zum Zweck des Versands verarbeitet.
        </p>
        <p style={S.p}>
          <strong style={S.strong}>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a
          und lit. b DSGVO. Mit Resend besteht ein Auftragsverarbeitungsvertrag
          gemäß Art. 28 DSGVO. Sofern eine Übermittlung in die USA stattfindet,
          erfolgt diese auf Grundlage geeigneter Garantien gemäß
          Art. 44 ff. DSGVO (insbesondere Standardvertragsklauseln).
        </p>
      </Section>

      {/* 4 — Datenbank und Hosting (Supabase) */}
      <Section n="4" title="Datenbank und Speicherung (Supabase)">
        <p style={S.p}>
          Die im Rahmen der Nutzung von CleanSync anfallenden Daten werden in
          einer Datenbank des Dienstes Supabase (Supabase, Inc.) gespeichert. Der
          von uns genutzte Serverstandort befindet sich innerhalb der
          Europäischen Union (Region Irland).
        </p>
        <p style={S.p}>
          <strong style={S.strong}>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b
          und lit. f DSGVO. Unser berechtigtes Interesse liegt in der sicheren,
          stabilen und effizienten Bereitstellung des Dienstes. Mit Supabase
          besteht ein Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO. Eine
          allfällige Übermittlung in Drittländer erfolgt auf Grundlage geeigneter
          Garantien gemäß Art. 44 ff. DSGVO.
        </p>
      </Section>

      {/* 5 — Hosting der Website (Vercel) */}
      <Section n="5" title="Hosting der Website (Vercel)">
        <p style={S.p}>
          Unsere Website wird bei Vercel Inc. gehostet. Beim Aufruf der Website
          verarbeitet Vercel technisch notwendige Daten, die Ihr Browser
          automatisch übermittelt, insbesondere IP-Adresse, Datum und Uhrzeit des
          Zugriffs, abgerufene Seite, übertragene Datenmenge sowie Angaben zu
          Browser und Betriebssystem. Diese Daten dienen der technischen
          Auslieferung der Website sowie der Gewährleistung von Stabilität und
          Sicherheit.
        </p>
        <p style={S.p}>
          <strong style={S.strong}>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f
          DSGVO. Unser berechtigtes Interesse liegt in der sicheren und
          zuverlässigen Bereitstellung der Website. Mit Vercel besteht ein
          Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO. Eine allfällige
          Übermittlung in die USA erfolgt auf Grundlage geeigneter Garantien
          gemäß Art. 44 ff. DSGVO.
        </p>
      </Section>

      {/* 6 — Spam-Schutz (Cloudflare Turnstile) */}
      <Section n="6" title="Spam-Schutz (Cloudflare Turnstile)">
        <p style={S.p}>
          Zum Schutz unseres Formulars vor missbräuchlicher Nutzung und
          automatisierten Anfragen (Bots) setzen wir Cloudflare Turnstile ein,
          einen Dienst der Cloudflare, Inc. Turnstile prüft, ob die Eingabe durch
          einen Menschen erfolgt. Dabei können technische Informationen wie
          IP-Adresse und Angaben zum Browser verarbeitet werden.
        </p>
        <p style={S.p}>
          <strong style={S.strong}>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f
          DSGVO. Unser berechtigtes Interesse liegt in der Abwehr von Missbrauch
          und der Gewährleistung der Sicherheit unseres Formulars. Eine
          allfällige Übermittlung in die USA erfolgt auf Grundlage geeigneter
          Garantien gemäß Art. 44 ff. DSGVO.
        </p>
      </Section>

      {/* 7 — Speicherdauer */}
      <Section n="7" title="Speicherdauer">
        <p style={S.p}>
          Wir speichern personenbezogene Daten nur so lange, wie es für die
          genannten Zwecke erforderlich ist oder gesetzliche
          Aufbewahrungspflichten bestehen.
        </p>
        <ul style={S.ul}>
          <li style={S.li}>
            Daten aus dem Anfrageformular werden gelöscht, sobald die Anfrage
            abschließend bearbeitet ist und keine gesetzlichen
            Aufbewahrungspflichten entgegenstehen, spätestens jedoch nach Widerruf
            Ihrer Einwilligung.
          </li>
          <li style={S.li}>
            Im Rahmen der Reinigungsabwicklung hochgeladene Fotos werden
            automatisch nach 90 Tagen gelöscht.
          </li>
          <li style={S.li}>
            Daten, die gesetzlichen Aufbewahrungsfristen unterliegen (etwa nach
            BAO oder UGB), werden für die Dauer der jeweiligen Frist aufbewahrt
            und danach gelöscht.
          </li>
        </ul>
      </Section>

      {/* 8 — Betroffenenrechte */}
      <Section n="8" title="Ihre Rechte">
        <p style={S.p}>
          Ihnen stehen hinsichtlich der von uns verarbeiteten
          personenbezogenen Daten folgende Rechte zu:
        </p>
        <ul style={S.ul}>
          <li style={S.li}>Recht auf Auskunft (Art. 15 DSGVO)</li>
          <li style={S.li}>Recht auf Berichtigung (Art. 16 DSGVO)</li>
          <li style={S.li}>Recht auf Löschung (Art. 17 DSGVO)</li>
          <li style={S.li}>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li style={S.li}>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li style={S.li}>Recht auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
          <li style={S.li}>
            Recht auf jederzeitigen Widerruf einer erteilten Einwilligung mit
            Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)
          </li>
        </ul>
        <p style={S.p}>
          Zur Ausübung dieser Rechte genügt eine formlose Mitteilung an die unter
          Punkt 1 genannte E-Mail-Adresse.
        </p>
      </Section>

      {/* 9 — Beschwerderecht / Aufsichtsbehörde */}
      <Section n="9" title="Beschwerderecht bei der Aufsichtsbehörde">
        <p style={S.p}>
          Wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer
          personenbezogenen Daten gegen die DSGVO oder das DSG verstößt, haben Sie
          das Recht, sich bei der österreichischen Datenschutzbehörde zu
          beschweren:
        </p>
        <p style={S.addr}>
          Österreichische Datenschutzbehörde<br />
          Barichgasse 40–42<br />
          1030 Wien<br />
          E-Mail: <a href="mailto:dsb@dsb.gv.at" style={S.link}>dsb@dsb.gv.at</a><br />
          Web: <a href="https://www.dsb.gv.at" target="_blank" rel="noopener noreferrer" style={S.link}>www.dsb.gv.at</a>
        </p>
      </Section>

      {/* 10 — Änderungen */}
      <Section n="10" title="Änderungen dieser Datenschutzerklärung">
        <p style={S.p}>
          Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an
          geänderte Rechtslagen oder an Änderungen unseres Dienstes und der
          Datenverarbeitung anzupassen. Es gilt jeweils die zum Zeitpunkt Ihres
          Besuchs auf dieser Seite veröffentlichte Fassung.
        </p>
      </Section>

      <footer style={S.footer}>
        <a href="/lead" style={S.footerLink}>← CleanSync</a>
        <span style={S.dot}>·</span>
        <a href="https://reinraum-team.com" target="_blank" rel="noopener noreferrer" style={S.footerLink}>
          reinraum-team.com
        </a>
      </footer>
    </main>
  )
}

// ── Section helper ────────────────────────────────────────────────
function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section style={S.section}>
      <h2 style={S.h2}>
        <span style={S.h2num}>{n}.</span> {title}
      </h2>
      {children}
    </section>
  )
}

// ── Styles (matches /lead design language) ────────────────────────
const S = {
  wrap: {
    minHeight:     '100vh',
    maxWidth:      720,
    margin:        '0 auto',
    padding:       '32px 20px 80px',
    color:         '#e8eaf0',
    lineHeight:    1.7,
  } as React.CSSProperties,
  back: {
    display:        'inline-block',
    fontSize:       13,
    color:          '#3b7ef8',
    textDecoration: 'none',
    marginBottom:   28,
  } as React.CSSProperties,
  h1: {
    fontSize:      'clamp(24px, 5vw, 32px)',
    fontWeight:    800,
    letterSpacing: '-0.5px',
    marginBottom:  6,
  },
  meta: {
    fontSize:     13,
    color:        '#4a5568',
    marginBottom: 28,
  },
  badges: {
    display:             'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap:                 10,
    marginBottom:        32,
  },
  badge: {
    display:       'flex',
    flexDirection: 'column' as const,
    alignItems:    'center',
    gap:           8,
    textAlign:     'center' as const,
    background:    'rgba(255,255,255,0.04)',
    border:        '1px solid rgba(255,255,255,0.08)',
    borderRadius:  12,
    padding:       '16px 10px',
  },
  badgeText: {
    fontSize:   12.5,
    fontWeight: 600,
    color:      '#e8eaf0',
    lineHeight: 1.35,
  },
  lead: {
    fontSize:     15,
    color:        '#8892a4',
    lineHeight:   1.75,
    marginBottom: 36,
    paddingBottom: 28,
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  } as React.CSSProperties,
  section: { marginBottom: 36 },
  h2: {
    fontSize:     17,
    fontWeight:   700,
    color:        '#e8eaf0',
    marginBottom: 12,
  },
  h2num: { color: '#3b7ef8' },
  p: {
    fontSize:     14,
    color:        '#8892a4',
    lineHeight:   1.75,
    marginBottom: 12,
  },
  strong: { color: '#e8eaf0', fontWeight: 600 },
  addr: {
    fontSize:     14,
    color:        '#8892a4',
    lineHeight:   1.8,
    background:    'rgba(255,255,255,0.04)',
    border:       '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding:      '14px 18px',
    marginBottom: 12,
  } as React.CSSProperties,
  ul: { margin: '0 0 12px', paddingLeft: 20 },
  li: {
    fontSize:     14,
    color:        '#8892a4',
    lineHeight:   1.7,
    marginBottom: 6,
  },
  link: {
    color:          '#3b7ef8',
    textDecoration: 'none',
  } as React.CSSProperties,
  footer: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            14,
    marginTop:      48,
    paddingTop:     24,
    borderTop:      '1px solid rgba(255,255,255,0.08)',
  },
  footerLink: {
    fontSize:       13,
    color:          '#4a5568',
    textDecoration: 'none',
  } as React.CSSProperties,
  dot: { color: '#2a3142' },
}
