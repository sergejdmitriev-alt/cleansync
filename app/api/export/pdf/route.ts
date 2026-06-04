import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { renderToBuffer } from '@react-pdf/renderer'
import type { DocumentProps } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import { MonthlyReport } from '@/lib/pdf-report'

export const dynamic = 'force-dynamic'
export const runtime  = 'nodejs'

export async function GET(req: NextRequest) {
  const serverSupabase = await createServerSupabaseClient()
  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const month = req.nextUrl.searchParams.get('month') // формат: 2026-06
  if (!month) return NextResponse.json({ error: 'month param required' }, { status: 400 })

  const from = `${month}-01T00:00:00.000Z`
  const to   = new Date(new Date(from).setMonth(new Date(from).getMonth() + 1)).toISOString()

  const supabase = createServiceSupabaseClient()
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*, properties(*), cleaners(*)')
    .eq('user_id', user.id)
    .eq('status', 'done')
    .gte('done_at', from)
    .lt('done_at', to)
    .order('done_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const monthLabel = new Date(from).toLocaleString('de-AT', { month: 'long', year: 'numeric' })

  try {
    const buffer = await renderToBuffer(
      createElement(MonthlyReport, { tasks: tasks ?? [], monthLabel }) as ReactElement<DocumentProps>
    )
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="CleanSync_${month}.pdf"`,
      },
    })
  } catch (err) {
    console.error('PDF error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
