import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { removeKeyboard, sendMessage, sendErledigtButton, getResponseMessages, sendHostNotification } from '@/lib/telegram'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const WELCOME: Record<string, string> = {
  ru: '👋 Привет! Ты подключён к CleanSync.\n\nЗдесь ты будешь получать задания на уборку. Жди уведомлений! 🧹',
  uk: '👋 Привіт! Ти підключений до CleanSync.\n\nТут ти будеш отримувати завдання на прибирання. Чекай сповіщень! 🧹',
  ro: '👋 Bună! Ești conectat la CleanSync.\n\nAici vei primi sarcini de curățenie. Așteaptă notificările! 🧹',
  pl: '👋 Cześć! Jesteś połączony z CleanSync.\n\nTutaj będziesz otrzymywać zlecenia sprzątania. Czekaj na powiadomienia! 🧹',
}

export async function POST(req: NextRequest) {
  const supabase = createServiceSupabaseClient()

  const secret = req.headers.get('x-telegram-bot-api-secret-token')
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await req.json()

  const message = body?.message
  if (message?.text === '/start') {
    const chatId = String(message.from.id)
    const { bot } = await import('@/lib/telegram')
    await bot.sendMessage(chatId, '👋 Willkommen bei CleanSync!\n\nBitte wähle deine Sprache / Выбери язык / Вибери мову / Alege limba / Wybierz język:', {
      reply_markup: {
        inline_keyboard: [[
          { text: '🇷🇺 Русский',    callback_data: 'lang_ru' },
          { text: '🇺🇦 Українська', callback_data: 'lang_uk' },
        ], [
          { text: '🇷🇴 Română',     callback_data: 'lang_ro' },
          { text: '🇵🇱 Polski',     callback_data: 'lang_pl' },
        ]],
      },
    })
    return NextResponse.json({ ok: true })
  }

  const callback = body?.callback_query
  if (!callback) return NextResponse.json({ ok: true })

  const data   = callback.data as string
  const chatId = String(callback.from.id)
  const msgId  = String(callback.message?.message_id)

  if (data.startsWith('lang_')) {
    const lang = data.slice(5)
    const { bot } = await import('@/lib/telegram')

    await supabase
      .from('cleaners')
      .update({ language: lang })
      .eq('telegram_chat_id', Number(chatId))

    await bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: Number(msgId) }
    )

    await sendMessage(chatId, WELCOME[lang])
    return NextResponse.json({ ok: true })
  }

  const underscoreIndex = data.indexOf('_')
  const action = data.slice(0, underscoreIndex)
  const taskId = data.slice(underscoreIndex + 1)

  if (!['accept', 'decline', 'done'].includes(action) || !taskId) {
    return NextResponse.json({ ok: true })
  }

  const { data: task } = await supabase
    .from('tasks')
    .select('id, status, cleaners(telegram_chat_id, language, name), properties(name)')
    .eq('id', taskId)
    .single()

  if (!task) return NextResponse.json({ ok: true })

  if (action === 'done' && task.status === 'done') {
    return NextResponse.json({ ok: true })
  }
  if (action !== 'done' && (task.status === 'accepted' || task.status === 'done')) {
    return NextResponse.json({ ok: true })
  }

  const lang         = (task.cleaners as any)?.language   ?? 'de'
  const cleanerName  = (task.cleaners as any)?.name       ?? 'Reinigungskraft'
  const propertyName = (task.properties as any)?.name     ?? 'Wohnung'
  const resp         = getResponseMessages(lang)

  if (action === 'accept') {
    await supabase
      .from('tasks')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', taskId)
    await removeKeyboard(chatId, msgId)
    await sendMessage(chatId, resp.accepted)
    await sendErledigtButton(chatId, taskId, lang)
    await sendHostNotification(`✅ ${cleanerName} hat den Auftrag angenommen — ${propertyName}`)
  } else if (action === 'decline') {
    await supabase
      .from('tasks')
      .update({ status: 'declined' })
      .eq('id', taskId)
    await removeKeyboard(chatId, msgId)
    await sendMessage(chatId, resp.declined)
  } else if (action === 'done') {
    await supabase
      .from('tasks')
      .update({ status: 'done', done_at: new Date().toISOString() })
      .eq('id', taskId)
    await removeKeyboard(chatId, msgId)
    await sendMessage(chatId, resp.done)
    await sendHostNotification(`🎉 Reinigung abgeschlossen — ${propertyName}`)
  }

  return NextResponse.json({ ok: true })
}
