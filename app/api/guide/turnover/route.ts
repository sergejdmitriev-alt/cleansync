import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import { GuidePDF, type Lang } from '@/lib/pdf-guide'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const lang: Lang = req.nextUrl.searchParams.get('lang') === 'en' ? 'en' : 'de'
  const filename   = lang === 'en'
    ? 'cleansync-guest-turnover-7-steps.pdf'
    : 'cleansync-gaestewechsel-7-schritte.pdf'

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buf = await renderToBuffer(createElement(GuidePDF, { lang }) as any)
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control':       'public, max-age=86400',
      },
    })
  } catch (err) {
    console.error('[guide/turnover]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
