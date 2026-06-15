import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import path from 'path'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: path.join(process.cwd(), 'public', 'fonts', 'Roboto-Regular.ttf'), fontWeight: 400 },
    { src: path.join(process.cwd(), 'public', 'fonts', 'Roboto-Bold.ttf'),    fontWeight: 700 },
  ],
})

const BG   = '#0D1117'
const CARD = '#161C28'
const BLUE = '#3b7ef8'
const T1   = '#E8EAF0'
const T2   = '#8892A4'
const T3   = '#4A5568'
const LINE = '#1F2937'

const s = StyleSheet.create({
  // ── Title page ──────────────────────────────────────
  titlePage: { backgroundColor: BG, fontFamily: 'Roboto' },
  titleWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48 },
  circle: {
    width: 400, height: 400, borderRadius: 200,
    backgroundColor: '#152040',
    alignItems: 'center', justifyContent: 'center', padding: 44,
  },
  tLogo:  { fontSize: 13, fontWeight: 700, color: BLUE, textAlign: 'center', marginBottom: 20 },
  tH1:    { fontSize: 30, fontWeight: 700, color: T1,   textAlign: 'center', lineHeight: 1.2, marginBottom: 14 },
  tSub:   { fontSize: 11, color: T2, textAlign: 'center', lineHeight: 1.55, marginBottom: 14 },
  tTag:   { fontSize: 9,  color: T3, textAlign: 'center' },

  // ── Content pages ────────────────────────────────────
  page:   { backgroundColor: BG, padding: 40, paddingBottom: 60, fontFamily: 'Roboto' },
  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTop: `1 solid ${LINE}`, paddingTop: 8 },
  fTxt:   { fontSize: 7, color: T3 },

  // intro card
  iCard: { backgroundColor: CARD, borderLeft: `3 solid ${BLUE}`, padding: '12 16', marginBottom: 20, borderRadius: 3 },
  iTitle:{ fontSize: 11, fontWeight: 700, color: T1, marginBottom: 8 },
  iPara: { fontSize: 9.5, color: T2, lineHeight: 1.65, marginBottom: 5 },

  // step card
  sLabel: { fontSize: 8, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 },
  sTitle: { fontSize: 13, fontWeight: 700, color: T1, marginBottom: 8 },
  sCard:  { backgroundColor: CARD, borderLeft: `3 solid ${BLUE}`, padding: '10 14', borderRadius: 3, marginBottom: 18 },
  sPara:  { fontSize: 9.5, color: T2, lineHeight: 1.65, marginBottom: 5 },
  sParaL: { fontSize: 9.5, color: T2, lineHeight: 1.65 },

  // bridge (Step 7 in der Praxis)
  bCard:  { backgroundColor: '#0C1F3A', borderLeft: `3 solid ${BLUE}`, padding: '14 18', borderRadius: 3, marginTop: 4 },
  bTitle: { fontSize: 12, fontWeight: 700, color: T1, marginBottom: 8 },
  bPara:  { fontSize: 9.5, color: T2, lineHeight: 1.65, marginBottom: 6 },
  bLink:  { fontSize: 10, fontWeight: 700, color: BLUE, marginTop: 10, textAlign: 'center' },

  // ── Checklist page ───────────────────────────────────
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

// ── Checklist data ────────────────────────────────────
const ROOMS = [
  { name: 'Bad', items: [
    'WC innen & außen, Spülung',     'Handtücher frisch, gefaltet',
    'Dusche/Wanne, Armaturen entkalkt', 'Toilettenpapier voll + Reserve',
    'Spiegel streifenfrei',          'Seife/Shampoo aufgefüllt',
    'Boden gewischt, Ecken',         'Mülleimer geleert',
  ]},
  { name: 'Küche', items: [
    'Arbeitsflächen abgewischt',     'Kühlschrank leer & sauber',
    'Spüle & Armatur',               'Geschirr sauber & verräumt',
    'Herd/Cerankochfeld',            'Boden gewischt',
    'Mikrowelle/Ofen innen',         'Müll raus, neuer Beutel',
  ]},
  { name: 'Schlafzimmer', items: [
    'Bettwäsche frisch bezogen',     'Boden gesaugt/gewischt',
    'Betten gemacht',                'Schrank leer & ausgewischt',
    'Staub: Flächen, Lampen',        'Fenster/Spiegel',
  ]},
  { name: 'Wohnbereich', items: [
    'Staub: Tisch, Regale, TV',      'Fenster/Glasflächen',
    'Sofa & Kissen geordnet',        'Fernbedienung/Schalter abgewischt',
    'Boden gesaugt/gewischt',
  ]},
  { name: 'Allgemein', items: [
    'Eingang/Flur',                  'Heizung/Klima auf Standard',
    'Lichtschalter & Griffe',        'Schlüssel/Box geprüft',
    'Geruch neutral, gelüftet',      'Fotos gemacht & gesendet',
  ]},
]

function Footer({ n }: { n: number }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.fTxt}>CleanSync — Der perfekte Gästewechsel in 7 Schritten</Text>
      <Text style={s.fTxt}>cleansync.at · {n}</Text>
    </View>
  )
}

function Step({ n, title, paras }: { n: number; title: string; paras: string[] }) {
  return (
    <View>
      <Text style={s.sLabel}>Schritt {n}</Text>
      <Text style={s.sTitle}>{title}</Text>
      <View style={s.sCard}>
        {paras.map((p, i) => (
          <Text key={i} style={i < paras.length - 1 ? s.sPara : s.sParaL}>{p}</Text>
        ))}
      </View>
    </View>
  )
}

export function GuidePDF() {
  return (
    <Document title="Der perfekte Gästewechsel in 7 Schritten — CleanSync">

      {/* ── Page 1: Title ── */}
      <Page size="A4" style={s.titlePage}>
        <View style={s.titleWrap}>
          <View style={s.circle}>
            <Text style={s.tLogo}>✦ CleanSync</Text>
            <Text style={s.tH1}>Der perfekte Gästewechsel{'\n'}in 7 Schritten</Text>
            <Text style={s.tSub}>
              Wie Wiener Gastgeber ihre Reinigung zwischen{'\n'}
              den Gästen sauber, pünktlich und ohne Chaos organisieren.
            </Text>
            <Text style={s.tTag}>Inklusive druckbarer Reinigungs-Checkliste</Text>
          </View>
        </View>
      </Page>

      {/* ── Page 2: Intro + Steps 1–2 ── */}
      <Page size="A4" style={s.page}>
        <View style={s.iCard}>
          <Text style={s.iTitle}>Bevor Sie beginnen</Text>
          <Text style={s.iPara}>
            Dieser Leitfaden ist aus der Praxis entstanden — aus über drei Jahren Reinigung von
            Wohnungen in Wien. Er funktioniert unabhängig davon, ob Sie ein Objekt oder zehn
            verwalten, und unabhängig von der Buchungsplattform.
          </Text>
          <Text style={[s.iPara, { marginBottom: 0 }]}>
            Kein Verkaufsgespräch — nur der Ablauf, der einen Gästewechsel reibungslos macht. Am
            Ende finden Sie eine Checkliste, die Sie ausdrucken und Ihrer Reinigungskraft direkt
            in die Hand geben können.
          </Text>
        </View>

        <Step n={1} title="Der Zeitplan — das enge Fenster zwischen Check-out und Check-in" paras={[
          'Bei den meisten Plattformen verlässt der Gast die Wohnung um 11:00 Uhr, der nächste checkt um 15:00 Uhr ein. Das sind vier Stunden — und in der Praxis weniger, weil An- und Abfahrt, Wäschewechsel und Kontrolle dazukommen.',
          'Planen Sie rückwärts vom Check-in: Die Reinigung sollte spätestens um 14:00 Uhr fertig sein, damit eine halbe Stunde Puffer für eine Nachkontrolle bleibt. Rechnen Sie für eine 1–2-Zimmer-Wohnung realistisch 90–120 Minuten gründliche Reinigung ein.',
          'Faustregel: Wenn zwischen Check-out und Check-in weniger als drei Stunden liegen, brauchen Sie eine fix eingeplante Reinigungskraft — keine, die Sie morgens erst suchen.',
        ]} />

        <Step n={2} title="Die Checkliste — was in jedem Raum geprüft wird" paras={[
          'Der häufigste Grund für schlechte Bewertungen ist nicht grober Schmutz, sondern Kleinigkeiten: ein Haar im Bad, ein Fleck am Spiegel, leere Toilettenpapierrolle. Eine feste Checkliste verhindert genau das.',
          'Geben Sie Ihrer Reinigungskraft eine Liste, die sie Raum für Raum abarbeitet — nicht „bitte sauber machen", sondern konkrete Punkte. Eine druckbare Vorlage finden Sie am Ende dieses Leitfadens.',
        ]} />

        <Footer n={2} />
      </Page>

      {/* ── Page 3: Steps 3–5 ── */}
      <Page size="A4" style={s.page}>
        <Step n={3} title="Verbrauchsmaterial — nie ohne Reserve" paras={[
          'Sorgen Sie dafür, dass frische Bettwäsche und Handtücher bereitliegen, bevor die Reinigungskraft kommt — sie bezieht die Betten mit dem, was Sie im Objekt hinterlegt haben. Halten Sie einen sauberen Satz griffbereit, damit der Wechsel nicht an fehlender Wäsche scheitert.',
          'Führen Sie eine kleine Bestandsliste für Verbrauchsmaterial: Toilettenpapier, Spülmittel, Müllbeutel, Kaffee/Tee, Seife. Lassen Sie die Reinigungskraft melden, was zur Neige geht — bevor es leer ist.',
        ]} />

        <Step n={4} title="Kommunikation — so vergeben Sie einen Auftrag ohne Rückfragen" paras={[
          'Die meiste Zeit verlieren Gastgeber nicht beim Putzen, sondern beim Koordinieren: „Kommst du morgen? Um wie viel Uhr? Welche Wohnung?" Drei Chats, fünf Nachfragen.',
          'Ein guter Auftrag enthält alles in einer Nachricht: Objekt, Adresse, Datum, Check-out-Zeit, Besonderheiten — und eine klare Bestätigung „angenommen / abgelehnt". Wenn Ihre Reinigungskraft eine andere Sprache spricht, schreiben Sie in ihrer Sprache. Missverständnisse kosten Stunden.',
        ]} />

        <Step n={5} title="Foto-Nachweis — Ihre Absicherung gegen Streit" paras={[
          'Ein Gast behauptet, die Wohnung sei schmutzig gewesen. Ohne Beweis steht Aussage gegen Aussage — und die Plattform gibt im Zweifel dem Gast recht.',
          'Lassen Sie sich nach jeder Reinigung ein paar Fotos schicken: Bad, Küche, Betten, Wohnbereich. Das diszipliniert die Reinigungskraft und gibt Ihnen im Streitfall einen klaren Nachweis. Archivieren Sie die Fotos pro Reinigung — nicht lose im Chat.',
        ]} />

        <Footer n={3} />
      </Page>

      {/* ── Page 4: Steps 6–7 + Bridge ── */}
      <Page size="A4" style={s.page}>
        <Step n={6} title="Der Notfallplan — wenn drei Stunden vor Check-in niemand da ist" paras={[
          'Reinigungskraft krank, verschlafen, nicht erreichbar — das passiert jedem Gastgeber. Entscheidend ist, dass Sie es früh merken, nicht eine Stunde vor Check-in.',
          'Bauen Sie eine Eskalation ein: Wenn bis zu einem festen Zeitpunkt keine Bestätigung da ist, greift ein Ersatz. Das kann eine zweite Reinigungskraft sein — oder ein professionelles Team, das kurzfristig einspringt. Wer keinen Plan B hat, zahlt ihn mit Bewertungen.',
        ]} />

        <Step n={7} title="Automatisieren statt koordinieren" paras={[
          'Die Schritte 1–6 funktionieren auch von Hand — solange Sie ein, zwei Objekte haben. Ab dem dritten wird das Koordinieren zum zweiten Job: Kalender im Blick, Nachrichten tippen, Fotos zusammensuchen, Notfälle abfangen.',
          'Genau an diesem Punkt lohnt es sich, den Ablauf zu automatisieren: Der Kalender erkennt den Gästewechsel selbst, der Auftrag geht per Tipp an die Reinigungskraft, Foto-Nachweis und Erinnerungen laufen automatisch, und für den Notfall steht ein Team bereit.',
        ]} />

        <View style={s.bCard}>
          <Text style={s.bTitle}>Schritt 7 in der Praxis</Text>
          <Text style={s.bPara}>
            Genau dafür haben wir CleanSync gebaut: Der iCal-Kalender erkennt den Gästewechsel
            automatisch, der Auftrag geht per Tipp an die Reinigungskraft — in ihrer Sprache —
            und Foto-Nachweis sowie Erinnerungen laufen von selbst.
          </Text>
          <Text style={s.bPara}>
            Und falls einmal keine eigene Reinigungskraft frei ist, springt unser Reinraum-Team
            in Wien ein — über 20 Wohnungen, seit über 3 Jahren, Antwort meist in Minuten.
          </Text>
          <Text style={s.bLink}>Sehen Sie, wie das bei Ihren Objekten aussieht → cleansync.at</Text>
        </View>

        <Footer n={4} />
      </Page>

      {/* ── Page 5: Printable Checklist ── */}
      <Page size="A4" style={s.clPage}>
        <Text style={s.clTitle}>Druckbare Reinigungs-Checkliste</Text>
        <Text style={s.clSub}>Pro Raum abarbeiten. Ausdrucken und der Reinigungskraft mitgeben.</Text>

        {ROOMS.map(room => (
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
          <Text style={s.fTxt}>CleanSync — Der perfekte Gästewechsel in 7 Schritten</Text>
          <Text style={s.fTxt}>cleansync.at · 5</Text>
        </View>
      </Page>

    </Document>
  )
}
