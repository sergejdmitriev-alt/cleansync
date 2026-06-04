import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const now = new Date()

  function addDays(d: Date, n: number) {
    const r = new Date(d)
    r.setDate(r.getDate() + n)
    return r
  }

  function fmt(d: Date) {
    return d.toISOString().split('T')[0].replace(/-/g, '')
  }

  const b1s = addDays(now, 7)
  const b1e = addDays(now, 12)
  const b2s = addDays(now, 13)
  const b2e = addDays(now, 17)
  const b3s = addDays(now, 19)
  const b3e = addDays(now, 23)

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CleanSync Test//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${fmt(b1s)}`,
    `DTEND;VALUE=DATE:${fmt(b1e)}`,
    'SUMMARY:TEST - Familie Müller',
    'UID:test-booking-001@cleansync-test',
    'END:VEVENT',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${fmt(b2s)}`,
    `DTEND;VALUE=DATE:${fmt(b2e)}`,
    'SUMMARY:TEST - Maria Sommer',
    'UID:test-booking-002@cleansync-test',
    'END:VEVENT',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${fmt(b3s)}`,
    `DTEND;VALUE=DATE:${fmt(b3e)}`,
    'SUMMARY:TEST - Johann Braun',
    'UID:test-booking-003@cleansync-test',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ics, {
    headers: {
      'Content-Type':        'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="test.ics"',
    },
  })
}
