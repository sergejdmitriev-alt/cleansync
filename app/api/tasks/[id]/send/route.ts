// @ts-nocheck
import { supabase } from '@/lib/supabase'
import { sendTaskNotification } from '@/lib/telegram'
import { NextResponse } from 'next/server'

export async function POST(_req, context) {
  const { id } = await context.params

  const { data: task, error } = await supabase
    .from('tasks')
    .select('*, properties(*), cleaners(*)')
    .eq('id', id)
    .single()

  if (error || !task) {
    return NextResponse.json({ error: 'Auftrag nicht gefunden' }, { status: 404 })
  }

  try {
    const messageId = await sendTaskNotification(task)
    await supabase
      .from('tasks')
      .update({ status: 'sent', telegram_message_id: messageId, sent_at: new Date().toISOString() })
      .eq('id', id)
    return NextResponse.json({ success: true, messageId })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fehler'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
