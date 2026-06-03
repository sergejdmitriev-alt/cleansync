import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/tasks — список задач с JOIN
export async function GET() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*, properties(*), cleaners(*)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/tasks — создать задачу
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const body = await req.json()
  const { property_id, cleaner_id, checkout_time, checkin_time, notes } = body

  if (!property_id || !cleaner_id || !checkout_time || !checkin_time) {
    return NextResponse.json({ error: 'Alle Felder sind erforderlich' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({ property_id, cleaner_id, checkout_time, checkin_time, notes, status: 'pending' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
