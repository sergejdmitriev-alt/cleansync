import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { sendTaskNotification } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createServerSupabaseClient()

  const { data: task, error } = await supabase
    .from('tasks')
    .select('*, cleaners(*), properties(*)')
    .eq('id', id)
    .single()

  if (error || !task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  await sendTaskNotification(task)

  const { error: updateError } = await supabase
    .from('tasks')
    .update({ sent_at: new Date().toISOString() })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
