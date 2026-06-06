import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { saveHostTelegramId } from '@/lib/profile'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ telegramId: '' })

  const { data } = await supabase
    .from('profiles')
    .select('telegram_chat_id')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ telegramId: data?.telegram_chat_id?.toString() ?? '' })
}

export async function POST(req: NextRequest) {
  const { telegramId } = await req.json()
  if (!telegramId || !/^\d+$/.test(telegramId)) {
    return NextResponse.json({ error: 'Ungültige ID' }, { status: 400 })
  }
  await saveHostTelegramId(telegramId)
  return NextResponse.json({ success: true })
}
