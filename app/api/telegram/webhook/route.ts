import { supabase } from '@/lib/supabase'
import { removeKeyboard, sendMessage } from '@/lib/telegram'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Верификация secret token
  const secret = req.headers.get('x-telegram-bot-api-secret-token')
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await req.json()
  const callback = body?.callback_query
  if (!callback) return NextResponse.json({ ok: true })

  const data   = callback.data as string        // "accept_UUID" или "decline_UUID"
  const chatId = String(callback.from.id)
  const msgId  = String(callback.message?.message_id)

  // Парсим action и taskId
  const underscoreIndex = data.indexOf('_')
  const action = data.slice(0, underscoreIndex)           // "accept" или "decline"
  const taskId = data.slice(underscoreIndex + 1)          // UUID задачи

  if (!['accept', 'decline'].includes(action) || !taskId) {
    return NextResponse.json({ ok: true })
  }

  // Получаем задачу
  const { data: task } = await supabase
    .from('tasks')
    .select('id, status, cleaners(telegram_chat_id)')
    .eq('id', taskId)
    .single()

  if (!task) return NextResponse.json({ ok: true })

  // Защита от повторных нажатий
  if (task.status === 'accepted' || task.status === 'done') {
    return NextResponse.json({ ok: true })
  }

  if (action === 'accept') {
    // Обновляем статус
    await supabase
      .from('tasks')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', taskId)

    // Убираем кнопки с сообщения
    await removeKeyboard(chatId, msgId)

    // Подтверждение уборщику
    await sendMessage(chatId, '✅ Auftrag angenommen! Viel Erfolg bei der Reinigung! 🧹')

  } else if (action === 'decline') {
    await supabase
      .from('tasks')
      .update({ status: 'declined' })
      .eq('id', taskId)

    await removeKeyboard(chatId, msgId)
    await sendMessage(chatId, '👌 Verstanden. Der Auftraggeber wurde benachrichtigt.')
  }

  return NextResponse.json({ ok: true })
}
