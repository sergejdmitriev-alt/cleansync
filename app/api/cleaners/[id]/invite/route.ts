import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const serverSupabase = await createServerSupabaseClient()
  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = crypto.randomBytes(24).toString('hex')
  const exp   = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()

  const supabase = createServiceSupabaseClient()
  const { error } = await supabase
    .from('cleaners')
    .update({ invite_token: token, invite_token_exp: exp })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const deeplink = `https://t.me/cleansync_bot?start=${token}`
  return NextResponse.json({ deeplink })
}
