import { createServerSupabaseClient } from './supabase/server'
import { createServiceSupabaseClient } from './supabase/service'

const FALLBACK_CHAT_ID = '451676731'

export async function getHostTelegramId(): Promise<string> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return FALLBACK_CHAT_ID

  const { data } = await supabase
    .from('profiles')
    .select('telegram_chat_id')
    .eq('id', user.id)
    .single()

  return data?.telegram_chat_id?.toString() ?? FALLBACK_CHAT_ID
}

export async function getHostTelegramIdForUser(userId: string): Promise<string> {
  const supabase = createServiceSupabaseClient()
  const { data } = await supabase
    .from('profiles')
    .select('telegram_chat_id')
    .eq('id', userId)
    .single()

  return data?.telegram_chat_id?.toString() ?? FALLBACK_CHAT_ID
}

export async function saveHostTelegramId(telegramId: string): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('profiles').upsert({
    id: user.id,
    telegram_chat_id: parseInt(telegramId),
  })
}
