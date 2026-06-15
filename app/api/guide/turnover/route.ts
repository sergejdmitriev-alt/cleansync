import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import { GuidePDF } from '@/lib/pdf-guide'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const buf = await renderToBuffer(createElement(GuidePDF))
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="cleansync-gaestewechsel-7-schritte.pdf"',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (err) {
    console.error('[guide/turnover]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
