'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getVoterToken, markCategoryVoted } from '../../lib/voter'

import type {Participant, VoteCount} from '../../types'

interface Props {
  participants: Participant[]
  categoryId: string
  hasVoted: boolean
  votedParticipantId?: string
}

export default function VotingGrid({ participants, categoryId, hasVoted: initialVoted, votedParticipantId }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(votedParticipantId || null)
  const [hasVoted, setHasVoted] = useState(initialVoted)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  console.log("PARTICIPANTS:", participants)
  async function handleVote() {
    if (!selected || hasVoted || loading) return
    setLoading(true)
    setError(null)

    try {
      const voterToken = getVoterToken()
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, participantId: selected, voterToken }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al votar')

      markCategoryVoted(categoryId)
      setHasVoted(true)
      setSuccess(true)
      router.refresh()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (participants.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10">
        No hay participantes en esta categoría aún.
      </div>
    )
  }


  return (

    <div>
      {success && (
        <div className="mb-4 p-3 rounded-lg bg-green-600/20 text-green-400 flex items-center gap-2">
          <span>✓</span> ¡Voto registrado! Gracias por participar.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-600/20 text-red-400">
          {error}
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {participants.map((p) => (
          <div
            key={p.id}
            onClick={() => !hasVoted && setSelected(p.id)}
            className={`
              cursor-pointer rounded-2xl overflow-hidden bg-[#111118] border
              transition-all duration-200
              ${selected === p.id ? 'border-blue-500 scale-105' : 'border-transparent'}
              ${hasVoted ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 hover:border-blue-400'}
            `}
          >
            {/* IMAGE */}
            <div className="relative aspect-square">
              <img
            src={p.photo_url}
            alt={p.name}
            onClick={(e) => {
              e.stopPropagation()
              setSelectedImage(p.photo_url)
            }}
            className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 hover:scale-105"
          />

              {selected === p.id && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">✓</span>
                </div>
              )}
            </div>


          </div>
        ))}
      </div>

      {/* ACTION */}
      {!hasVoted && (
        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-4">
            {selected
              ? `Seleccionaste a ${participants.find(p => p.id === selected)?.name}`
              : 'Haz clic en una foto para seleccionarla'}
          </p>

          <button
            onClick={handleVote}
            disabled={!selected || loading}
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Enviando...' : 'Confirmar voto →'}
          </button>
        </div>
      )}

      {/* YA VOTÓ */}
      {hasVoted && !success && (
        <div className="mt-6 text-center text-green-400 flex justify-center items-center gap-2">
          <span>✓</span> Ya votaste en esta categoría.
        </div>
      )}

    </div>

  )
}