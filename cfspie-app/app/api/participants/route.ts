import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/app/lib/supabase'


export async function POST(req: NextRequest) {
  const body = await req.json()
  const admin = createSupabaseAdminClient()

  const { data, error } = await admin
    .from('participants')
    .insert([body])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}