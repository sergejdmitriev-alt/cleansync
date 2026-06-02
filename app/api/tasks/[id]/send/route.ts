import { supabase } from '@/lib/supabase'
import { sendTaskNotification } from '@/lib/telegram'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  // Получаем задачу с данными объекта и уборщика
  const { data: task, error } = await supabase
    .from('tasks')
    .select('*, properties(*), cleaners(*)')
    .eq('id', id)
    .single()

  if (error || !task) {
    return NextResponse.json({ error: 'Auftrag nicht gefunden' }, { status: 404 })
  }

  try {
    // Отправляем сообщение в Telegram
    const messageId = await sendTaskNotification(task)

    // Обновляем статус и сохраняем ID сообщения
    await supabase
      .from('tasks')
      .update({
        status: 'sent',
        telegram_message_id: messageId,
        sent_at: new Date().toISOString(),
      })
      .eq('id', id)

    return NextResponse.json({ success: true, messageId })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
