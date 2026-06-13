import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { renderToBuffer } from '@react-pdf/renderer'
import type { DocumentProps } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import { ProtocolPDF } from '@/lib/pdf-protocol'

export const dynamic = 'force-dynamic'
export const runtime  = 'nodejs'

function toSlug(str: string): string {
  return str.toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const serverSupabase = await createServerSupabaseClient()
  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceSupabaseClient()

  const { data: task, error: taskErr } = await supabase
    .from('tasks')
    .select('*, properties(*), cleaners(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (taskErr || !task) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (task.status !== 'done') return NextResponse.json({ error: 'Task not done' }, { status: 400 })

  const { data: photoRows } = await supabase
    .from('task_photos')
    .select('id, photo_type, storage_path, caption')
    .eq('task_id', id)
    .order('created_at', { ascending: true })

  // Fetch each image as base64 data URI for reliable embedding
  const photos = await Promise.all(
    (photoRows ?? []).map(async photo => {
      try {
        const { data: urlData } = await supabase.storage
          .from('task-photos')
          .createSignedUrl(photo.storage_path, 300)

        if (!urlData?.signedUrl) return { ...photo, dataUri: null }

        const res    = await fetch(urlData.signedUrl)
        const buf    = await res.arrayBuffer()
        const b64    = Buffer.from(buf).toString('base64')
        const mime   = res.headers.get('content-type') ?? 'image/jpeg'
        return { ...photo, dataUri: `data:${mime};base64,${b64}` }
      } catch {
        return { ...photo, dataUri: null }
      }
    })
  )

  const objSlug   = toSlug(task.properties?.name ?? 'objekt')
  const dateStr   = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Vienna', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(task.checkout_time))
  const filename  = `protokoll-${objSlug}-${dateStr}.pdf`

  try {
    const buffer = await renderToBuffer(
      createElement(ProtocolPDF, { task, photos }) as ReactElement<DocumentProps>
    )
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('[protocol pdf]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
