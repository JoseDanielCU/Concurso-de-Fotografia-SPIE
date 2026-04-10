import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '../../lib/supabase'

export async function GET(req: NextRequest) {
  const supabase = createSupabaseAdminClient()

  const { searchParams } = new URL(req.url)
  const voterToken = searchParams.get('voterToken')

  // 🔥 CASO 1: usuario normal
  if (voterToken) {
    const { data, error } = await supabase
      .from('votes')
      .select('category_id')
      .eq('voter_token', voterToken)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  }

  // 🔥 CASO 2: admin (sin filtro)
  const { data, error } = await supabase
    .from('votes')
    .select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {

  try {
    const { categoryId, participantId, voterToken } = await req.json()

    if (!categoryId || !participantId || !voterToken) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()

    // Check current phase
    const { data: settings } = await supabase
      .from('settings')
      .select('current_phase')
      .single()

    if (settings?.current_phase !== 1 ) {
      return NextResponse.json({ error: 'La votación pública está cerrada' }, { status: 403 })
    }

    // Check if participant belongs to category
    const { data: participant } = await supabase
      .from('participants')
      .select('id, category_id')
      .eq('id', participantId)
      .eq('category_id', categoryId)
      .single()

    if (!participant) {
      return NextResponse.json({ error: 'Participante no válido' }, { status: 400 })
    }

    // Check if already voted in this category (by token)
    const { data: existing } = await supabase
      .from('votes')
      .select('id')
      .eq('category_id', categoryId)
      .eq('voter_token', voterToken)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Ya votaste en esta categoría' }, { status: 409 })
    }

    // Insert vote
    const { error: voteError } = await supabase.from('votes').insert({
      category_id: categoryId,
      participant_id: participantId,
      voter_token: voterToken,
    })

    if (voteError) throw voteError

    // Increment vote count on participant
    const { error: updateError } = await supabase.rpc('increment_votes', {
      participant_id: participantId,
    })

    if (updateError) {
      // Fallback: manual increment
      const { data: current } = await supabase
        .from('participants')
        .select('votes_count')
        .eq('id', participantId)
        .single()

      await supabase
        .from('participants')
        .update({ votes_count: (current?.votes_count ?? 0) + 1 })
        .eq('id', participantId)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Vote error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}