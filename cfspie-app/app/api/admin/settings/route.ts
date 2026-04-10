import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/app/lib/supabase'

export async function GET() {
  const admin = createSupabaseAdminClient()

  const { data, error } = await admin
    .from('settings')
    .select('*')
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || 'No se pudo obtener la configuración' },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const admin = createSupabaseAdminClient()
  const body = await req.json()

  // Obtener configuración actual
  const { data: current, error: currentError } = await admin
    .from('settings')
    .select('id')
    .single()

  if (currentError || !current) {
    return NextResponse.json(
      { error: currentError?.message || 'Configuración no encontrada' },
      { status: 500 }
    )
  }

  // Actualizar configuración
  const { data, error } = await admin
    .from('settings')
    .update({
      ...body,
      updated_at: new Date().toISOString(),
    })
    .eq('id', current.id)
    .select()
    .single()

  if (error || !data) {
    console.error('SETTINGS PATCH ERROR:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al actualizar configuración' },
      { status: 400 }
    )
  }

  return NextResponse.json(data)
}