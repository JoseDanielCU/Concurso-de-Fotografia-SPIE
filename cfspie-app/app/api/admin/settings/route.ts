import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/app/lib/supabase'

export async function GET() {
  const admin = createSupabaseAdminClient()

  const { data, error } = await admin
    .from('settings')
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
export async function PATCH(req: NextRequest) {
  const admin = createSupabaseAdminClient()
  const body = await req.json()

  const { data: current } = await admin
    .from('settings')
    .select('id')
    .single()

  const { data, error } = await admin
    .from('settings')
    .update({
      ...body,
      updated_at: new Date().toISOString(),
    })
    .eq('id', current.id)
    .select()
    .single()

  if (error) {
    console.error('SETTINGS PATCH ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}