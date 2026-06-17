import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import path from 'path'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: path.join(process.cwd(), 'public', 'fonts', 'Roboto-Regular.ttf'), fontWeight: 400 },
    { src: path.join(process.cwd(), 'public', 'fonts', 'Roboto-Bold.ttf'),    fontWeight: 700 },
  ],
})

export type Lang = 'de' | 'en'

// ── Content ───────────────────────────────────────────────────────
interface RoomDef  { name: string; items: string[] }
interface StepDef  { title: string; paras: string[] }
interface GuideContent {
  docTitle:       string
  titleH1:        string
  titleSub:       string
  titleTag:       string
  beforeTitle:    string
  beforeParas:    string[]
  stepPrefix:     string
  steps:          StepDef[]
  bridgeTitle:    string
  bridgeParas:    string[]
  bridgeLink:     string
  checklistTitle: string
  checklistSub:   string
  rooms:          RoomDef[]
  footerText:     string
}

const CONTENT: Record<Lang, GuideContent> = {
  de: {
    docTitle:    'Der perfekte Gästewechsel in 7 Schritten — CleanSync',
    titleH1:     'Der perfekte Gästewechsel\nin 7 Schritten',
    titleSub:    'Wie Wiener Gastgeber ihre Reinigung zwischen\nden Gästen sauber, pünktlich und ohne Chaos organisieren.',
    titleTag:    'Inklusive druckbarer Reinigungs-Checkliste',
    beforeTitle: 'Bevor Sie beginnen',
    beforeParas: [
      'Dieser Leitfaden ist aus der Praxis entstanden — aus über drei Jahren Reinigung von Wohnungen in Wien. Er funktioniert unabhängig davon, ob Sie ein Objekt oder zehn verwalten, und unabhängig von der Buchungsplattform.',
      'Kein Verkaufsgespräch — nur der Ablauf, der einen Gästewechsel reibungslos macht. Am Ende finden Sie eine Checkliste, die Sie ausdrucken und Ihrer Reinigungskraft direkt in die Hand geben können.',
    ],
    stepPrefix: 'Schritt',
    steps: [
      {
        title: 'Der Zeitplan — das enge Fenster zwischen Check-out und Check-in',
        paras: [
          'Bei den meisten Plattformen verlässt der Gast die Wohnung um 11:00 Uhr, der nächste checkt um 15:00 Uhr ein. Das sind vier Stunden — und in der Praxis weniger, weil An- und Abfahrt, Wäschewechsel und Kontrolle dazukommen.',
          'Planen Sie rückwärts vom Check-in: Die Reinigung sollte spätestens um 14:00 Uhr fertig sein, damit eine halbe Stunde Puffer für eine Nachkontrolle bleibt. Rechnen Sie für eine 1–2-Zimmer-Wohnung realistisch 90–120 Minuten gründliche Reinigung ein.',
          'Faustregel: Wenn zwischen Check-out und Check-in weniger als drei Stunden liegen, brauchen Sie eine fix eingeplante Reinigungskraft — keine, die Sie morgens erst suchen.',
        ],
      },
      {
        title: 'Die Checkliste — was in jedem Raum geprüft wird',
        paras: [
          'Der häufigste Grund für schlechte Bewertungen ist nicht grober Schmutz, sondern Kleinigkeiten: ein Haar im Bad, ein Fleck am Spiegel, leere Toilettenpapierrolle. Eine feste Checkliste verhindert genau das.',
          'Geben Sie Ihrer Reinigungskraft eine Liste, die sie Raum für Raum abarbeitet — nicht „bitte sauber machen", sondern konkrete Punkte. Eine druckbare Vorlage finden Sie am Ende dieses Leitfadens.',
        ],
      },
      {
        title: 'Verbrauchsmaterial — nie ohne Reserve',
        paras: [
          'Sorgen Sie dafür, dass frische Bettwäsche und Handtücher bereitliegen, bevor die Reinigungskraft kommt — sie bezieht die Betten mit dem, was Sie im Objekt hinterlegt haben. Halten Sie einen sauberen Satz griffbereit, damit der Wechsel nicht an fehlender Wäsche scheitert.',
          'Führen Sie eine kleine Bestandsliste für Verbrauchsmaterial: Toilettenpapier, Spülmittel, Müllbeutel, Kaffee/Tee, Seife. Lassen Sie die Reinigungskraft melden, was zur Neige geht — bevor es leer ist.',
        ],
      },
      {
        title: 'Kommunikation — so vergeben Sie einen Auftrag ohne Rückfragen',
        paras: [
          'Die meiste Zeit verlieren Gastgeber nicht beim Putzen, sondern beim Koordinieren: „Kommst du morgen? Um wie viel Uhr? Welche Wohnung?" Drei Chats, fünf Nachfragen.',
          'Ein guter Auftrag enthält alles in einer Nachricht: Objekt, Adresse, Datum, Check-out-Zeit, Besonderheiten — und eine klare Bestätigung „angenommen / abgelehnt". Wenn Ihre Reinigungskraft eine andere Sprache spricht, schreiben Sie in ihrer Sprache. Missverständnisse kosten Stunden.',
        ],
      },
      {
        title: 'Foto-Nachweis — Ihre Absicherung gegen Streit',
        paras: [
          'Ein Gast behauptet, die Wohnung sei schmutzig gewesen. Ohne Beweis steht Aussage gegen Aussage — und die Plattform gibt im Zweifel dem Gast recht.',
          'Lassen Sie sich nach jeder Reinigung ein paar Fotos schicken: Bad, Küche, Betten, Wohnbereich. Das diszipliniert die Reinigungskraft und gibt Ihnen im Streitfall einen klaren Nachweis. Archivieren Sie die Fotos pro Reinigung — nicht lose im Chat.',
        ],
      },
      {
        title: 'Der Notfallplan — wenn drei Stunden vor Check-in niemand da ist',
        paras: [
          'Reinigungskraft krank, verschlafen, nicht erreichbar — das passiert jedem Gastgeber. Entscheidend ist, dass Sie es früh merken, nicht eine Stunde vor Check-in.',
          'Bauen Sie eine Eskalation ein: Wenn bis zu einem festen Zeitpunkt keine Bestätigung da ist, greift ein Ersatz. Das kann eine zweite Reinigungskraft sein — oder ein professionelles Team, das kurzfristig einspringt. Wer keinen Plan B hat, zahlt ihn mit Bewertungen.',
        ],
      },
      {
        title: 'Automatisieren statt koordinieren',
        paras: [
          'Die Schritte 1–6 funktionieren auch von Hand — solange Sie ein, zwei Objekte haben. Ab dem dritten wird das Koordinieren zum zweiten Job: Kalender im Blick, Nachrichten tippen, Fotos zusammensuchen, Notfälle abfangen.',
          'Genau an diesem Punkt lohnt es sich, den Ablauf zu automatisieren: Der Kalender erkennt den Gästewechsel selbst, der Auftrag geht per Tipp an die Reinigungskraft, Foto-Nachweis und Erinnerungen laufen automatisch, und für den Notfall steht ein Team bereit.',
        ],
      },
    ],
    bridgeTitle: 'Schritt 7 in der Praxis',
    bridgeParas: [
      'Genau dafür haben wir CleanSync gebaut: Der iCal-Kalender erkennt den Gästewechsel automatisch, der Auftrag geht per Tipp an die Reinigungskraft — in ihrer Sprache — und Foto-Nachweis sowie Erinnerungen laufen von selbst.',
      'Und falls einmal keine eigene Reinigungskraft frei ist, springt unser Reinraum-Team in Wien ein — über 20 Wohnungen, seit über 3 Jahren, Antwort meist in Minuten.',
    ],
    bridgeLink:     'Sehen Sie, wie das bei Ihren Objekten aussieht → cleansync.at',
    checklistTitle: 'Druckbare Reinigungs-Checkliste',
    checklistSub:   'Pro Raum abarbeiten. Ausdrucken und der Reinigungskraft mitgeben.',
    rooms: [
      { name: 'Bad',         items: ['WC innen & außen, Spülung', 'Handtücher frisch, gefaltet', 'Dusche/Wanne, Armaturen entkalkt', 'Toilettenpapier voll + Reserve', 'Spiegel streifenfrei', 'Seife/Shampoo aufgefüllt', 'Boden gewischt, Ecken', 'Mülleimer geleert'] },
      { name: 'Küche',       items: ['Arbeitsflächen abgewischt', 'Kühlschrank leer & sauber', 'Spüle & Armatur', 'Geschirr sauber & verräumt', 'Herd/Cerankochfeld', 'Boden gewischt', 'Mikrowelle/Ofen innen', 'Müll raus, neuer Beutel'] },
      { name: 'Schlafzimmer',items: ['Bettwäsche frisch bezogen', 'Boden gesaugt/gewischt', 'Betten gemacht', 'Schrank leer & ausgewischt', 'Staub: Flächen, Lampen', 'Fenster/Spiegel'] },
      { name: 'Wohnbereich', items: ['Staub: Tisch, Regale, TV', 'Fenster/Glasflächen', 'Sofa & Kissen geordnet', 'Fernbedienung/Schalter abgewischt', 'Boden gesaugt/gewischt'] },
      { name: 'Allgemein',   items: ['Eingang/Flur', 'Heizung/Klima auf Standard', 'Lichtschalter & Griffe', 'Schlüssel/Box geprüft', 'Geruch neutral, gelüftet', 'Fotos gemacht & gesendet'] },
    ],
    footerText: 'CleanSync — Der perfekte Gästewechsel in 7 Schritten',
  },

  en: {
    docTitle:    'The Perfect Guest Turnover in 7 Steps — CleanSync',
    titleH1:     'The Perfect\nGuest Turnover in 7 Steps',
    titleSub:    'How Vienna hosts keep their cleaning between guests\nclean, on time and free of chaos.',
    titleTag:    'Includes a printable cleaning checklist',
    beforeTitle: 'Before you start',
    beforeParas: [
      'This guide comes from practice — from over three years of cleaning apartments in Vienna. It works whether you manage one property or ten, and regardless of the booking platform.',
      "No sales pitch — just the workflow that makes a guest turnover run smoothly. At the end you'll find a checklist you can print and hand straight to your cleaner.",
    ],
    stepPrefix: 'Step',
    steps: [
      {
        title: 'Timing — the tight window between check-out and check-in',
        paras: [
          "On most platforms the guest leaves at 11:00, the next one checks in at 15:00. That's four hours — and in practice less, once you add travel, the linen change and a final check.",
          'Plan backwards from check-in: the cleaning should be done by 14:00 at the latest, leaving half an hour of buffer for a quick inspection. For a one- to two-room flat, budget a realistic 90–120 minutes of thorough cleaning.',
          'Rule of thumb: if there are fewer than three hours between check-out and check-in, you need a cleaner booked in advance — not one you start looking for that morning.',
        ],
      },
      {
        title: 'The checklist — what gets checked in every room',
        paras: [
          "The most common reason for a bad review isn't heavy dirt — it's small things: a hair in the bathroom, a smudge on the mirror, an empty toilet roll. A fixed checklist prevents exactly that.",
          "Give your cleaner a list they work through room by room — not just 'please clean', but concrete points. You'll find a printable template at the end of this guide.",
        ],
      },
      {
        title: 'Supplies — never without a reserve',
        paras: [
          "Make sure fresh bed linen and towels are ready before the cleaner arrives — they make up the beds with what you've stocked in the property. Keep a clean set on hand so the turnover never fails for lack of linen.",
          "Keep a small inventory list for consumables: toilet paper, dish soap, bin bags, coffee/tea, hand soap. Have the cleaner report what's running low — before it runs out.",
        ],
      },
      {
        title: 'Communication — assigning a job without back-and-forth',
        paras: [
          "Hosts lose most of their time not on cleaning but on coordinating: 'Are you coming tomorrow? What time? Which flat?' Three chats, five follow-ups.",
          "A good job request contains everything in one message: property, address, date, check-out time, anything special — plus a clear 'accepted / declined' confirmation. If your cleaner speaks another language, write in theirs. Misunderstandings cost hours.",
        ],
      },
      {
        title: 'Photo proof — your protection against disputes',
        paras: [
          "A guest claims the flat was dirty. Without evidence it's their word against yours — and the platform tends to side with the guest.",
          'Have a few photos sent after every cleaning: bathroom, kitchen, beds, living area. It keeps the cleaner accountable and gives you clear proof if a dispute comes up. Archive the photos per cleaning — not loose in a chat.',
        ],
      },
      {
        title: 'The backup plan — when no one shows three hours before check-in',
        paras: [
          'Cleaner sick, overslept, unreachable — it happens to every host. What matters is noticing it early, not an hour before check-in.',
          "Build in an escalation: if there's no confirmation by a set time, a backup steps in. That can be a second cleaner — or a professional team that covers on short notice. A host without a plan B pays for it in reviews.",
        ],
      },
      {
        title: 'Automate instead of coordinate',
        paras: [
          "Steps 1–6 work by hand too — as long as you have one or two properties. From the third on, coordinating becomes a second job: watching the calendar, typing messages, chasing photos, catching emergencies.",
          "That's exactly the point where automating the workflow pays off: the calendar detects the turnover itself, the job goes to the cleaner with one tap, photo proof and reminders run automatically, and a team is on standby for emergencies.",
        ],
      },
    ],
    bridgeTitle: 'Step 7 in practice',
    bridgeParas: [
      "That's exactly what we built CleanSync for: the iCal calendar detects the turnover automatically, the job goes to the cleaner with one tap — in their language — and photo proof and reminders run on their own.",
      "And if a cleaner of your own is ever unavailable, our Reinraum team in Vienna steps in — 20+ properties, 3+ years, replies usually within minutes.",
    ],
    bridgeLink:     'See what this looks like for your properties → cleansync.at',
    checklistTitle: 'Printable cleaning checklist',
    checklistSub:   'Work through room by room. Print it and hand it to your cleaner.',
    rooms: [
      { name: 'Bathroom',    items: ['Toilet inside & out, flush', 'Towels fresh, folded', 'Shower/tub, fittings descaled', 'Toilet paper full + reserve', 'Mirror streak-free', 'Soap/shampoo refilled', 'Floor mopped, corners', 'Bin emptied'] },
      { name: 'Kitchen',     items: ['Countertops wiped', 'Fridge empty & clean', 'Sink & tap', 'Dishes clean & put away', 'Stove/cooktop', 'Floor mopped', 'Microwave/oven inside', 'Bin out, new bag'] },
      { name: 'Bedroom',     items: ['Bed linen freshly made', 'Floor vacuumed/mopped', 'Beds made', 'Wardrobe empty & wiped', 'Dust: surfaces, lamps', 'Window/mirror'] },
      { name: 'Living area', items: ['Dust: table, shelves, TV', 'Windows/glass', 'Sofa & cushions arranged', 'Remote/switches wiped', 'Floor vacuumed/mopped'] },
      { name: 'General',     items: ['Entrance/hallway', 'Heating/AC to default', 'Light switches & handles', 'Keys/box checked', 'Neutral smell, aired out', 'Photos taken & sent'] },
    ],
    footerText: 'CleanSync — The Perfect Guest Turnover in 7 Steps',
  },
}

// ── Styles ────────────────────────────────────────────────────────
const BG   = '#0D1117'
const CARD = '#161C28'
const BLUE = '#3b7ef8'
const T1   = '#E8EAF0'
const T2   = '#8892A4'
const T3   = '#4A5568'
const LINE = '#1F2937'

const s = StyleSheet.create({
  titlePage: { backgroundColor: BG, fontFamily: 'Roboto' },
  titleWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48 },
  circle: { width: 400, height: 400, borderRadius: 200, backgroundColor: '#152040', alignItems: 'center', justifyContent: 'center', padding: 44 },
  tLogo:  { fontSize: 13, fontWeight: 700, color: BLUE, textAlign: 'center', marginBottom: 20 },
  tH1:    { fontSize: 28, fontWeight: 700, color: T1,   textAlign: 'center', lineHeight: 1.2, marginBottom: 14 },
  tSub:   { fontSize: 11, color: T2, textAlign: 'center', lineHeight: 1.55, marginBottom: 14 },
  tTag:   { fontSize: 9,  color: T3, textAlign: 'center' },

  page:   { backgroundColor: BG, padding: 40, paddingBottom: 60, fontFamily: 'Roboto' },
  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTop: `1 solid ${LINE}`, paddingTop: 8 },
  fTxt:   { fontSize: 7, color: T3 },

  iCard:  { backgroundColor: CARD, borderLeft: `3 solid ${BLUE}`, padding: '12 16', marginBottom: 20, borderRadius: 3 },
  iTitle: { fontSize: 11, fontWeight: 700, color: T1, marginBottom: 8 },
  iPara:  { fontSize: 9.5, color: T2, lineHeight: 1.65, marginBottom: 5 },

  sLabel: { fontSize: 8, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 },
  sTitle: { fontSize: 13, fontWeight: 700, color: T1, marginBottom: 8 },
  sCard:  { backgroundColor: CARD, borderLeft: `3 solid ${BLUE}`, padding: '10 14', borderRadius: 3, marginBottom: 18 },
  sPara:  { fontSize: 9.5, color: T2, lineHeight: 1.65, marginBottom: 5 },
  sParaL: { fontSize: 9.5, color: T2, lineHeight: 1.65 },

  bCard:  { backgroundColor: '#0C1F3A', borderLeft: `3 solid ${BLUE}`, padding: '14 18', borderRadius: 3, marginTop: 4 },
  bTitle: { fontSize: 12, fontWeight: 700, color: T1, marginBottom: 8 },
  bPara:  { fontSize: 9.5, color: T2, lineHeight: 1.65, marginBottom: 6 },
  bLink:  { fontSize: 10, fontWeight: 700, color: BLUE, marginTop: 10, textAlign: 'center' },

  clPage:  { backgroundColor: BG, padding: '36 36 56 36', fontFamily: 'Roboto' },
  clTitle: { fontSize: 16, fontWeight: 700, color: T1, marginBottom: 4 },
  clSub:   { fontSize: 9,  color: T2, marginBottom: 20 },
  clRoom:  { backgroundColor: CARD, padding: '10 14 6 14', borderRadius: 4, marginBottom: 12 },
  clRoomT: { fontSize: 10, fontWeight: 700, color: T1, marginBottom: 8 },
  clGrid:  { flexDirection: 'row', flexWrap: 'wrap' },
  clItem:  { width: '50%', flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6, paddingRight: 6 },
  clBox:   { width: 8, height: 8, borderRadius: 1, border: `1.5 solid ${T3}`, marginRight: 5, marginTop: 0.5, flexShrink: 0 },
  clTxt:   { fontSize: 8.5, color: T2, lineHeight: 1.35, flex: 1 },
  clFooter:{ position: 'absolute', bottom: 20, left: 36, right: 36, flexDirection: 'row', justifyContent: 'space-between', borderTop: `1 solid ${LINE}`, paddingTop: 8 },
})

// ── Sub-components ────────────────────────────────────────────────
function Footer({ n, text }: { n: number; text: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.fTxt}>{text}</Text>
      <Text style={s.fTxt}>cleansync.at · {n}</Text>
    </View>
  )
}

function Step({ n, prefix, title, paras }: { n: number; prefix: string; title: string; paras: string[] }) {
  return (
    <View>
      <Text style={s.sLabel}>{prefix} {n}</Text>
      <Text style={s.sTitle}>{title}</Text>
      <View style={s.sCard}>
        {paras.map((p, i) => (
          <Text key={i} style={i < paras.length - 1 ? s.sPara : s.sParaL}>{p}</Text>
        ))}
      </View>
    </View>
  )
}

// ── Main export ───────────────────────────────────────────────────
export function GuidePDF({ lang = 'de' }: { lang?: Lang }) {
  const c = CONTENT[lang]

  return (
    <Document title={c.docTitle}>

      {/* Page 1: Title */}
      <Page size="A4" style={s.titlePage}>
        <View style={s.titleWrap}>
          <View style={s.circle}>
            <Text style={s.tLogo}>✦ CleanSync</Text>
            <Text style={s.tH1}>{c.titleH1}</Text>
            <Text style={s.tSub}>{c.titleSub}</Text>
            <Text style={s.tTag}>{c.titleTag}</Text>
          </View>
        </View>
      </Page>

      {/* Page 2: Intro + Steps 1–2 */}
      <Page size="A4" style={s.page}>
        <View style={s.iCard}>
          <Text style={s.iTitle}>{c.beforeTitle}</Text>
          {c.beforeParas.map((p, i) => (
            <Text key={i} style={[s.iPara, i === c.beforeParas.length - 1 ? { marginBottom: 0 } : {}]}>{p}</Text>
          ))}
        </View>
        <Step n={1} prefix={c.stepPrefix} title={c.steps[0].title} paras={c.steps[0].paras} />
        <Step n={2} prefix={c.stepPrefix} title={c.steps[1].title} paras={c.steps[1].paras} />
        <Footer n={2} text={c.footerText} />
      </Page>

      {/* Page 3: Steps 3–5 */}
      <Page size="A4" style={s.page}>
        <Step n={3} prefix={c.stepPrefix} title={c.steps[2].title} paras={c.steps[2].paras} />
        <Step n={4} prefix={c.stepPrefix} title={c.steps[3].title} paras={c.steps[3].paras} />
        <Step n={5} prefix={c.stepPrefix} title={c.steps[4].title} paras={c.steps[4].paras} />
        <Footer n={3} text={c.footerText} />
      </Page>

      {/* Page 4: Steps 6–7 + Bridge */}
      <Page size="A4" style={s.page}>
        <Step n={6} prefix={c.stepPrefix} title={c.steps[5].title} paras={c.steps[5].paras} />
        <Step n={7} prefix={c.stepPrefix} title={c.steps[6].title} paras={c.steps[6].paras} />
        <View style={s.bCard}>
          <Text style={s.bTitle}>{c.bridgeTitle}</Text>
          {c.bridgeParas.map((p, i) => (
            <Text key={i} style={s.bPara}>{p}</Text>
          ))}
          <Text style={s.bLink}>{c.bridgeLink}</Text>
        </View>
        <Footer n={4} text={c.footerText} />
      </Page>

      {/* Page 5: Printable Checklist */}
      <Page size="A4" style={s.clPage}>
        <Text style={s.clTitle}>{c.checklistTitle}</Text>
        <Text style={s.clSub}>{c.checklistSub}</Text>
        {c.rooms.map(room => (
          <View key={room.name} style={s.clRoom}>
            <Text style={s.clRoomT}>{room.name}</Text>
            <View style={s.clGrid}>
              {room.items.map(item => (
                <View key={item} style={s.clItem}>
                  <View style={s.clBox} />
                  <Text style={s.clTxt}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
        <View style={s.clFooter} fixed>
          <Text style={s.fTxt}>{c.footerText}</Text>
          <Text style={s.fTxt}>cleansync.at · 5</Text>
        </View>
      </Page>

    </Document>
  )
}
