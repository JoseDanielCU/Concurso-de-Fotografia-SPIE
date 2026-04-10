'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getVoterToken, markCategoryVoted } from '../../lib/voter'
import type { Participant } from '../../types'

interface Props {
  participants: Participant[]
  categoryId: string
  hasVoted: boolean
  votedParticipantId?: string
}

export default function VotingGrid({
  participants,
  categoryId,
  hasVoted: initialVoted,
  votedParticipantId,
}: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(votedParticipantId || null)
  const [hasVoted, setHasVoted] = useState(initialVoted)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [glitchText, setGlitchText] = useState('')

  const selectedParticipant = participants.find((p) => p.id === selected)

  function handleSelect(id: string) {
    if (hasVoted || loading) return
    setSelected((prev) => (prev === id ? null : id))
  }

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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  // Glitch effect
  useEffect(() => {
    if (!selectedParticipant || hasVoted) {
      setGlitchText(selectedParticipant?.name ?? '')
      return
    }

    const chars = '█▓▒░<>/\\[]{}—=+*#@$%&?'
    const interval = setInterval(() => {
      const corrupted = Array.from({ length: selectedParticipant.name.length })
        .map(() => chars[Math.floor(Math.random() * chars.length)])
        .join('')
      setGlitchText(corrupted)
    }, 50)

    return () => clearInterval(interval)
  }, [selectedParticipant, hasVoted])

  if (participants.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0', color: '#6b6b8a' }}>
        <span style={{ display: 'block', fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>◈</span>
        <p>No hay participantes en esta categoría aún.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Feedback */}
      {success && (
        <div style={{
          marginBottom: '1.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem',
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
          color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem'
        }}>
          <span>✓</span>
          <span>¡Voto registrado! Gracias por participar.</span>
        </div>
      )}

      {error && (
        <div style={{
          marginBottom: '1.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem',
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          color: '#f87171', fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}

      {!hasVoted && (
        <p style={{ fontSize: '0.875rem', color: '#6b6b8a', marginBottom: '1.5rem', textAlign: 'center' }}>
          Selecciona una foto y confirma tu voto.
        </p>
      )}

      {/* GRID LIMPIO */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {participants.map((p) => {
          const isSelected = selected === p.id

          return (
            <div
              key={p.id}
              onClick={() => handleSelect(p.id)}
              style={{
                borderRadius: '1rem',
                overflow: 'hidden',
                background: '#0e0e1a',
                border: isSelected
                  ? '2px solid #6366f1'
                  : '1px solid rgba(255,255,255,0.06)',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 0 20px rgba(99,102,241,0.25)' : 'none',
                cursor: hasVoted ? 'default' : 'pointer',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1 / 1',
                }}
              >
                <img
                  src={p.photo_url}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  draggable={false}
                />

                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(99,102,241,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '50%',
                      background: '#6366f1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
                    }}>
                      <span style={{ color: 'white', fontSize: '1.1rem' }}>✓</span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxUrl(p.photo_url)
                  }}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '0.5rem',
                    background: 'rgba(0,0,0,0.7)',
                    border: 'none',
                    color: 'rgba(255,255,255,0.8)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                  }}
                >
                  ⤢
                </button>

                {hasVoted && isSelected && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(49,46,129,0.9), transparent)',
                    padding: '0.5rem 0.75rem',
                  }}>
                    <span style={{ fontSize: '0.75rem', color: '#a5b4fc' }}>
                      Tu voto
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Confirmación */}
      {!hasVoted && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b6b8a',
            fontFamily: 'monospace',
            minHeight: '1.25rem',
          }}>
            {selectedParticipant
              ? `Seleccionaste: ${glitchText}`
              : 'Ninguna foto seleccionada'}
          </p>

          <button
            onClick={handleVote}
            disabled={!selected || loading}
            style={{
              marginTop: '1rem',
              padding: '0.875rem 1.5rem',
              borderRadius: '1rem',
              border: 'none',
              background: selected && !loading ? '#4f46e5' : 'rgba(255,255,255,0.05)',
              color: selected && !loading ? 'white' : 'rgba(255,255,255,0.25)',
              cursor: selected && !loading ? 'pointer' : 'not-allowed',
            }}
          >
            {loading ? 'Enviando...' : 'Confirmar voto →'}
          </button>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <img
            src={lightboxUrl}
            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '1rem' }}
          />
        </div>
      )}
    </div>
  )
}