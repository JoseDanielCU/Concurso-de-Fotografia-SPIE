'use client'
import { useEffect, useState } from 'react'
import type {Category, Participant, Phase, VoteCount} from '@/app/types'

export default function AdminResults() {
  const [categories, setCategories] = useState<Category[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [votes, setVotes] = useState<VoteCount[]>([])
  const [phase, setPhase] = useState<Phase | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const getVotes = (participantId: string) =>
  votes.filter(v => v.participant_id === participantId).length

  async function load() {
    const [catsRes, partsRes, votesRes, settingsRes] = await Promise.all([
      fetch('/api/categories'),
      fetch('/api/participants'),
      fetch('/api/votes'),
      fetch('/api/admin/settings'),
    ])

    setCategories(await catsRes.json())
    setParticipants(await partsRes.json())
    setVotes(await votesRes.json())
    const s = await settingsRes.json()
    setPhase(s.current_phase)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function promoteFinalists(catId: string) {
    const cat = categories.find(c => c.id === catId)
    if (!cat) return

    const catParticipants = participants
      .filter(p => p.category_id === catId)
      .sort((a, b) =>
  getVotes(b.id) - getVotes(a.id)
)
      .slice(0, cat.max_phase2_participants)

    if (!confirm(`¿Promover top ${cat.max_phase2_participants} de "${cat.name}"?`)) return

    setSaving(catId + '_promote')

    await Promise.all(catParticipants.map(p =>
      fetch(`/api/participants/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_phase2_finalist: true }),
      })
    ))

    await load()
    setSaving(null)
  }

  async function setWinner(participantId: string, categoryId: string) {
    if (!confirm('¿Marcar como ganador?')) return
    setSaving(participantId)

    const catParticipants = participants.filter(p => p.category_id === categoryId)

    await Promise.all(catParticipants.map(p =>
      fetch(`/api/participants/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_winner: false }),
      })
    ))

    await fetch(`/api/participants/${participantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_winner: true }),
    })

    await load()
    setSaving(null)
  }

  async function clearWinner(participantId: string) {
    setSaving(participantId)

    await fetch(`/api/participants/${participantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_winner: false }),
    })

    await load()
    setSaving(null)
  }

  if (loading) {
    return <p className="text-gray-400 p-6">Cargando...</p>
  }

  return (
    <div className="p-6 text-white">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Resultados Fase 2</h1>
          <p className="text-gray-400 text-sm">
            Selecciona finalistas y ganador por categoría
          </p>
        </div>

        {phase && (
          <span className="px-3 py-1 rounded-full text-sm bg-indigo-600">
            {phase === 1 ? 'Fase 1' : phase === 2 ? 'Fase 2' : 'Resultados'}
          </span>
        )}
      </div>

      {/* WARNING */}
      {phase === 1 && (
        <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-400 px-4 py-3 rounded-lg mb-6 text-sm">
          ⚠ Estás en Fase 1. Cambia de fase para gestionar finalistas.
        </div>
      )}

      {/* CATEGORIES */}
      <div className="space-y-8">
        {categories.map(cat => {
          const catParts = participants
            .filter(p => p.category_id === cat.id)
            .sort((a, b) =>
            getVotes(b.id) - getVotes(a.id)
          )

          const finalists = catParts.filter(p => p.is_phase2_winner)
          const winner = catParts.find(p => p.is_finalist)
          const hasFinalists = finalists.length > 0

          return (
            <div key={cat.id} className="bg-[#111827] border border-gray-800 rounded-xl p-6">

              {/* HEADER CAT */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{cat.name}</h2>
                  <p className="text-gray-400 text-sm">
                    {catParts.length} participantes · {finalists.length} finalistas · máx {cat.max_phase2_participants}
                  </p>
                </div>

                {!hasFinalists && phase !== 1 && (
                  <button
                    onClick={() => promoteFinalists(cat.id)}
                    disabled={saving === cat.id + '_promote'}
                    className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm"
                  >
                    {saving === cat.id + '_promote'
                      ? 'Promoviendo...'
                      : `Promover top ${cat.max_phase2_participants}`}
                  </button>
                )}

                {winner && (
                  <span className="text-yellow-400 text-sm">
                    ♛ Ganador: {winner.name}
                  </span>
                )}
              </div>

              {/* PARTICIPANTS */}
              <div className="space-y-3">
                {catParts.length === 0 && (
                  <p className="text-gray-500 text-sm">
                    Sin participantes
                  </p>
                )}

                {catParts.map((p, i) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-3 rounded-lg border
                      ${p.is_phase2_winner ? 'border-yellow-500 bg-yellow-500/10' : 'border-gray-800'}
                      ${p.is_finalist ? 'bg-indigo-500/5' : ''}
                    `}
                  >
                    {/* LEFT */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400 w-6">
                        #{i + 1}
                      </span>

                      <img
                        src={p.photo_url || '/placeholder.png'}
                        className="w-12 h-12 object-cover rounded-lg"
                      />

                      <div className="flex flex-col">
                        <span className="font-medium">{p.name}</span>

                        <div className="flex gap-2 text-xs">
                          {p.is_phase2_winner && (
                            <span className="text-yellow-400">♛ Ganador</span>
                          )}
                          {p.is_finalist && !p.is_phase2_winner && (
                            <span className="text-indigo-400">Finalista</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400">
                        {getVotes(p.id)} votos
                      </span>

                      {(phase === 2 || phase === 'results') && p.is_finalist && (
                        p.is_phase2_winner ? (
                          <button
                            onClick={() => clearWinner(p.id)}
                            disabled={!!saving}
                            className="text-xs text-gray-400 hover:text-white"
                          >
                            Quitar
                          </button>
                        ) : (
                          <button
                            onClick={() => setWinner(p.id, cat.id)}
                            disabled={!!saving}
                            className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1 text-xs rounded"
                          >
                            {saving === p.id ? '...' : 'Ganador'}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}

              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}