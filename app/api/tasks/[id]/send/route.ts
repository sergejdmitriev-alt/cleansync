import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { sendTaskNotification, sendAgencyNotification } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServiceSupabaseClient()

  const { data: task, error } = await supabase
    .from('tasks')
    .select('*, cleaners(*), properties(*)')
    .eq('id', id)
    .single()

  if (error || !task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  if (task.send_to_agency) {
    const msgId = await sendAgencyNotification(task)

    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        status: 'reinraum_pending',
        sent_at: new Date().toISOString(),
        ...(msgId ? { telegram_message_id: String(msgId) } : {}),
      })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }
  } else {
    await sendTaskNotification(task)

    const { error: updateError } = await supabase
      .from('tasks')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
