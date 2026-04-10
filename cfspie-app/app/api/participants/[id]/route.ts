import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/app/lib/supabase'

interface Params {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const admin = createSupabaseAdminClient()

  const { data, error } = await admin
    .from('participants')
    .update({
      ...body,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()

  if (error) {
    console.error('PATCH PARTICIPANT ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data?.[0] ?? null)
}
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const admin = createSupabaseAdminClient()

  const { error } = await admin.from('participants').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
export async function GET() {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("participants")
    .select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
