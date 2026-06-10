import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import crypto from 'crypto'

export const runtime = 'nodejs'

export async function POST() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = crypto.randomBytes(24).toString('hex')
  const exp   = new Date(Date.now() + 10 * 60 * 1000) // +10 минут

  const { error: dbError } = await supabase
    .from('profiles')
    .update({
      connect_token:     token,
      connect_token_exp: exp.toISOString(),
    })
    .eq('id', user.id)

  if (dbError) {
    console.error('[generate-token]', dbError)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  return NextResponse.json({
    token,
    deeplink: `https://t.me/cleansync_bot?start=${token}`,
    exp: exp.toISOString(),
  })
}
