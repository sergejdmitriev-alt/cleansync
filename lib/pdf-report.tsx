import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://raw.githubusercontent.com/google/fonts/main/apache/roboto/static/Roboto-Regular.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://raw.githubusercontent.com/google/fonts/main/apache/roboto/static/Roboto-Bold.ttf',
      fontWeight: 700,
    },
  ],
})

const s = StyleSheet.create({
  page:       { padding: 40, fontFamily: 'Roboto', fontSize: 10, color: '#1a1a1a' },
  header:     { marginBottom: 24 },
  title:      { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  subtitle:   { fontSize: 11, color: '#666' },
  statsRow:   { flexDirection: 'row', gap: 16, marginBottom: 24 },
  statBox:    { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 6, flex: 1 },
  statNum:    { fontSize: 18, fontWeight: 700, marginBottom: 2 },
  statLabel:  { fontSize: 9, color: '#888' },
  tableHead:  { flexDirection: 'row', backgroundColor: '#f0f0f0', padding: '8 10', borderRadius: 4, marginBottom: 4 },
  tableRow:   { flexDirection: 'row', padding: '8 10', borderBottom: '1 solid #eee' },
  colObj:     { flex: 2 },
  colCleaner: { flex: 1.5 },
  colDate:    { flex: 1.5 },
  colDone:    { flex: 1.5 },
  headText:   { fontSize: 8, fontWeight: 700, color: '#555', textTransform: 'uppercase' },
  cellMain:   { fontWeight: 700, fontSize: 10, marginBottom: 2 },
  cellSub:    { fontSize: 8, color: '#888' },
  cellText:   { fontSize: 10 },
  footer:     { position: 'absolute', bottom: 30, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#aaa' },
})

function fmt(dt: string) {
  return new Date(dt).toLocaleString('de-AT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtShort(dt: string) {
  return new Date(dt).toLocaleString('de-AT', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export function MonthlyReport({ tasks, monthLabel }: { tasks: any[]; monthLabel: string }) {
  const byProperty: Record<string, number> = {}
  const byCleaner:  Record<string, number> = {}

  tasks.forEach(t => {
    const prop = t.properties?.name ?? '—'
    const cln  = t.cleaners?.name ?? 'Reinraum'
    byProperty[prop] = (byProperty[prop] ?? 0) + 1
    byCleaner[cln]   = (byCleaner[cln]   ?? 0) + 1
  })

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>CleanSync – Monatsübersicht</Text>
          <Text style={s.subtitle}>{monthLabel}</Text>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statNum}>{tasks.length}</Text>
            <Text style={s.statLabel}>Reinigungen gesamt</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statNum}>{Object.keys(byProperty).length}</Text>
            <Text style={s.statLabel}>Objekte</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statNum}>{Object.keys(byCleaner).length}</Text>
            <Text style={s.statLabel}>Reinigungskräfte</Text>
          </View>
        </View>

        {/* Table header */}
        <View style={s.tableHead}>
          <Text style={[s.headText, s.colObj]}>Objekt</Text>
          <Text style={[s.headText, s.colCleaner]}>Reinigungskraft</Text>
          <Text style={[s.headText, s.colDate]}>Abreise</Text>
          <Text style={[s.headText, s.colDate]}>Anreise</Text>
          <Text style={[s.headText, s.colDone]}>Abgeschlossen</Text>
        </View>

        {/* Rows */}
        {tasks.map((task, i) => (
          <View key={task.id ?? i} style={s.tableRow} wrap={false}>
            <View style={s.colObj}>
              <Text style={s.cellMain}>{task.properties?.name ?? '—'}</Text>
              <Text style={s.cellSub}>{task.properties?.address ?? ''}</Text>
            </View>
            <Text style={[s.cellText, s.colCleaner]}>
              {task.send_to_agency ? 'Reinraum' : (task.cleaners?.name ?? '—')}
            </Text>
            <Text style={[s.cellText, s.colDate]}>{fmtShort(task.checkout_time)}</Text>
            <Text style={[s.cellText, s.colDate]}>{fmtShort(task.checkin_time)}</Text>
            <Text style={[s.cellText, s.colDone]}>
              {task.done_at ? fmtShort(task.done_at) : '—'}
            </Text>
          </View>
        ))}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>CleanSync – Exportiert am {fmt(new Date().toISOString())}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          } />
        </View>

      </Page>
    </Document>
  )
}
