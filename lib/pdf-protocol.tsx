import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer'
import path from 'path'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: path.join(process.cwd(), 'public', 'fonts', 'Roboto-Regular.ttf'), fontWeight: 400 },
    { src: path.join(process.cwd(), 'public', 'fonts', 'Roboto-Bold.ttf'),    fontWeight: 700 },
  ],
})

const STATUS_LABELS: Record<string, string> = {
  done:               'Erledigt',
  accepted:           'Angenommen',
  sent:               'Gesendet',
  pending:            'Ausstehend',
  declined:           'Abgelehnt',
  reinraum_pending:   'Reinraum – Anfrage',
  reinraum_confirmed: 'Reinraum – Bestätigt',
  reinraum_declined:  'Reinraum – Abgelehnt',
}

const s = StyleSheet.create({
  page:        { padding: 40, fontFamily: 'Roboto', fontSize: 10, color: '#1a1a1a' },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, paddingBottom: 16, borderBottom: '2 solid #e5e7eb' },
  logo:        { fontSize: 14, fontWeight: 700, color: '#1d4ed8' },
  title:       { fontSize: 18, fontWeight: 700, color: '#111827' },
  infoBlock:   { marginBottom: 24 },
  infoGrid:    { flexDirection: 'row', flexWrap: 'wrap' },
  infoCell:    { width: '50%', marginBottom: 12 },
  label:       { fontSize: 8, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3, fontWeight: 700 },
  value:       { fontSize: 10, color: '#111827', fontWeight: 700 },
  section:     { marginBottom: 24 },
  sectionTitle:{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 12, paddingBottom: 6, borderBottom: '1 solid #e5e7eb' },
  photoRow:    { flexDirection: 'row', marginBottom: 12 },
  photoCell:   { width: '48%', marginRight: '4%' },
  photoCellR:  { width: '48%' },
  photoImg:    { width: '100%', height: 140, objectFit: 'cover', borderRadius: 4, backgroundColor: '#f3f4f6' },
  photoCaption:{ fontSize: 8, color: '#374151', marginTop: 4 },
  photoType:   { fontSize: 7, color: '#9ca3af', marginTop: 2 },
  noPhoto:     { width: '100%', height: 140, backgroundColor: '#f3f4f6', borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  noPhotoText: { fontSize: 8, color: '#9ca3af' },
  notes:       { fontSize: 10, color: '#374151', lineHeight: 1.5, backgroundColor: '#f9fafb', padding: 10, borderRadius: 4 },
  footer:      { position: 'absolute', bottom: 28, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTop: '1 solid #e5e7eb', paddingTop: 8 },
  footerText:  { fontSize: 7, color: '#9ca3af' },
})

function fmt(dt: string) {
  return new Date(dt).toLocaleString('de-AT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

type Photo = {
  id: string
  photo_type: string
  caption: string | null
  dataUri: string | null
}

type Task = {
  properties?: { name?: string; address?: string } | null
  cleaners?:   { name?: string } | null
  send_to_agency?: boolean
  checkout_time:   string
  checkin_time:    string
  status:          string
  done_at?:        string | null
  notes?:          string | null
}

export function ProtocolPDF({ task, photos }: { task: Task; photos: Photo[] }) {
  const cleaningPhotos = photos.filter(p => p.photo_type === 'completion')
  const problemPhotos  = photos.filter(p => p.photo_type === 'problem')
  const generatedAt    = fmt(new Date().toISOString())

  function PhotoGrid({ items }: { items: Photo[] }) {
    const pairs: Photo[][] = []
    for (let i = 0; i < items.length; i += 2) pairs.push(items.slice(i, i + 2))

    return (
      <>
        {pairs.map((pair, pi) => (
          <View key={pi} style={s.photoRow} wrap={false}>
            {pair.map((photo, ci) => (
              <View key={photo.id} style={ci === 0 ? s.photoCell : s.photoCellR}>
                {photo.dataUri ? (
                  <Image src={photo.dataUri} style={s.photoImg} />
                ) : (
                  <View style={s.noPhoto}>
                    <Text style={s.noPhotoText}>Bild nicht verfügbar</Text>
                  </View>
                )}
                {photo.caption && <Text style={s.photoCaption}>{photo.caption}</Text>}
                <Text style={s.photoType}>
                  {photo.photo_type === 'completion' ? 'Reinigung' : 'Problem'}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </>
    )
  }

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.logo}>✦ CleanSync</Text>
          <Text style={s.title}>Übergabe-Protokoll</Text>
        </View>

        {/* Info table */}
        <View style={s.infoBlock}>
          <View style={s.infoGrid}>
            <View style={s.infoCell}>
              <Text style={s.label}>Objekt</Text>
              <Text style={s.value}>{task.properties?.name ?? '—'}</Text>
            </View>
            {task.properties?.address && (
              <View style={s.infoCell}>
                <Text style={s.label}>Adresse</Text>
                <Text style={s.value}>{task.properties.address}</Text>
              </View>
            )}
            <View style={s.infoCell}>
              <Text style={s.label}>Check-out</Text>
              <Text style={s.value}>{fmt(task.checkout_time)}</Text>
            </View>
            <View style={s.infoCell}>
              <Text style={s.label}>Check-in</Text>
              <Text style={s.value}>{fmt(task.checkin_time)}</Text>
            </View>
            <View style={s.infoCell}>
              <Text style={s.label}>Reinigungskraft</Text>
              <Text style={s.value}>
                {task.send_to_agency ? 'Reinraum' : (task.cleaners?.name ?? '—')}
              </Text>
            </View>
            <View style={s.infoCell}>
              <Text style={s.label}>Status</Text>
              <Text style={s.value}>{STATUS_LABELS[task.status] ?? task.status}</Text>
            </View>
            {task.done_at && (
              <View style={s.infoCell}>
                <Text style={s.label}>Abgeschlossen am</Text>
                <Text style={s.value}>{fmt(task.done_at)}</Text>
              </View>
            )}
          </View>
          {task.notes && (
            <View>
              <Text style={[s.label, { marginBottom: 6 }]}>Notizen</Text>
              <Text style={s.notes}>{task.notes}</Text>
            </View>
          )}
        </View>

        {/* Completion photos */}
        {cleaningPhotos.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Reinigungsfotos ({cleaningPhotos.length})</Text>
            <PhotoGrid items={cleaningPhotos} />
          </View>
        )}

        {/* Problem photos */}
        {problemPhotos.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Gemeldete Probleme ({problemPhotos.length})</Text>
            <PhotoGrid items={problemPhotos} />
          </View>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Erstellt mit CleanSync — cleansync.at · {generatedAt}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

      </Page>
    </Document>
  )
}
