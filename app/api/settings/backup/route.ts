import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceSupabaseClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export async function GET() {
  const serverSb = await createServerSupabaseClient()
  const { data: { user } } = await serverSb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceSupabaseClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('auto_backup_enabled, escalation_hours')
    .eq('id', user.id)
    .single()

  return NextResponse.json({
    auto_backup_enabled: profile?.auto_backup_enabled ?? false,
    escalation_hours:    profile?.escalation_hours    ?? 4,
  })
}

export async function PATCH(req: NextRequest) {
  const serverSb = await createServerSupabaseClient()
  const { data: { user } } = await serverSb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { auto_backup_enabled, escalation_hours } = await req.json()

  const supabase = createServiceSupabaseClient()
  await supabase
    .from('profiles')
    .update({ auto_backup_enabled, escalation_hours })
    .eq('id', user.id)

  return NextResponse.json({ ok: true })
}
