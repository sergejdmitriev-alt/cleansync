import { sendTaskNotification } from '@/lib/telegram'

export const OFFER_REJECT_CUTOFF_HOURS = 4

export function canReject(checkoutTime: string): boolean {
  return new Date(checkoutTime).getTime() - Date.now() > OFFER_REJECT_CUTOFF_HOURS * 3600 * 1000
}

export async function buildOfferQueue(supabase: any, propertyId: string): Promise<string[]> {
  const { data } = await supabase
    .from('property_cleaner_priority')
    .select('cleaner_id')
    .eq('property_id', propertyId)
    .order('priority', { ascending: true })
  return (data ?? []).map((r: any) => r.cleaner_id)
}

export async function startOffer(
  supabase: any,
  task: any,
): Promise<{ mode: 'cascade' | 'single' | 'none'; cleanerId?: string }> {
  const queue = await buildOfferQueue(supabase, task.property_id)

  if (queue.length > 0) {
    const { data: cleaners } = await supabase
      .from('cleaners')
      .select('id, telegram_chat_id')
      .in('id', queue)

    const cleanerMap = new Map<string, { id: string; telegram_chat_id: string | number | null }>((cleaners ?? []).map((c: any) => [c.id, c]))

    let firstId: string | undefined
    let firstIdx = 0
    for (let i = 0; i < queue.length; i++) {
      const c = cleanerMap.get(queue[i])
      if (c?.telegram_chat_id) { firstId = c.id; firstIdx = i; break }
    }

    if (!firstId) return { mode: 'none' }

    await supabase.from('tasks').update({
      offer_cleaner_ids: queue,
      offer_index:       firstIdx,
      offer_sent_at:     new Date().toISOString(),
      cleaner_id:        firstId,
      status:            'sent',
      sent_at:           new Date().toISOString(),
    }).eq('id', task.id)

    return { mode: 'cascade', cleanerId: firstId }
  }

  if (task.cleaner_id) return { mode: 'single' }
  return { mode: 'none' }
}

// advanceOffer переиспользуем будущим кроном /api/cron/offer-timeout
// для авто-перехода по OFFER_TIMEOUT_MINUTES=15 после перехода на Vercel Pro.
// Сейчас вызывается только из webhook при отказе.
export async function advanceOffer(
  supabase: any,
  taskId: string,
): Promise<{ result: 'next' | 'exhausted' | 'noqueue'; cleanerId?: string; task?: any }> {
  const { data: task } = await supabase
    .from('tasks')
    .select('id, offer_cleaner_ids, offer_index, property_id, status, checkout_time, user_id')
    .eq('id', taskId)
    .single()

  if (!task) return { result: 'noqueue' }

  const queue: string[] | null = task.offer_cleaner_ids
  if (!queue || queue.length === 0) return { result: 'noqueue' }

  const { data: cleaners } = await supabase
    .from('cleaners')
    .select('id, telegram_chat_id, language, name')
    .in('id', queue)

  const cleanerMap = new Map<string, { id: string; telegram_chat_id: string | number | null }>((cleaners ?? []).map((c: any) => [c.id, c]))

  const startIdx = (task.offer_index ?? 0) + 1
  let nextId: string | undefined
  let nextIdx = startIdx

  for (let i = startIdx; i < queue.length; i++) {
    const c = cleanerMap.get(queue[i])
    if (c?.telegram_chat_id) { nextId = c.id; nextIdx = i; break }
  }

  if (!nextId) return { result: 'exhausted', task }

  await supabase.from('tasks').update({
    cleaner_id:    nextId,
    offer_index:   nextIdx,
    offer_sent_at: new Date().toISOString(),
    status:        'sent',
    accepted_at:   null,
  }).eq('id', taskId)

  const { data: fullTask } = await supabase
    .from('tasks')
    .select('*, cleaners(*), properties(*)')
    .eq('id', taskId)
    .single()

  if (fullTask) {
    await sendTaskNotification(fullTask).catch(e =>
      console.error('[advanceOffer] sendTaskNotification failed:', e)
    )
  }

  return { result: 'next', cleanerId: nextId, task: fullTask }
}
