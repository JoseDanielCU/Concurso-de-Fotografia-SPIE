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

  // Glitch effect en nombre seleccionado
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
      {/* Mensajes de feedback */}
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

      {/* Instrucción */}
      {!hasVoted && (
        <p style={{ fontSize: '0.875rem', color: '#6b6b8a', marginBottom: '1.5rem', textAlign: 'center' }}>
          Selecciona una foto y confirma tu voto.
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {participants.map((p) => {
          const isSelected = selected === p.id

          return (
            <div
              key={p.id}
              style={{
                borderRadius: '1rem',
                overflow: 'hidden',
                background: '#0e0e1a',
                border: isSelected
                  ? '2px solid #6366f1'
                  : '1px solid rgba(255,255,255,0.06)',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                transition: 'border 0.15s, transform 0.15s, box-shadow 0.15s',
                boxShadow: isSelected ? '0 0 20px rgba(99,102,241,0.25)' : 'none',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Foto — clickeable en desktop */}
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '1 / 1',
                  cursor: hasVoted ? 'default' : 'pointer',
                }}
                onClick={() => handleSelect(p.id)}
              >
                <img
                  src={p.photo_url}
                  alt={p.name}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    display: 'block', pointerEvents: 'none',
                  }}
                  draggable={false}
                />

                {/* Overlay seleccionado */}
                {isSelected && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(99,102,241,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none',
                  }}>
                    <div style={{
                      width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                      background: '#6366f1', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
                    }}>
                      <span style={{ color: 'white', fontSize: '1.1rem' }}>✓</span>
                    </div>
                  </div>
                )}

                {/* Botón zoom */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setLightboxUrl(p.photo_url) }}
                  style={{
                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                    width: '2rem', height: '2rem', borderRadius: '0.5rem',
                    background: 'rgba(0,0,0,0.7)', border: 'none',
                    color: 'rgba(255,255,255,0.8)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.875rem', touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                  } as React.CSSProperties}
                  aria-label="Ver foto ampliada"
                >
                  ⤢
                </button>

                {/* Tag "Tu voto" */}
                {hasVoted && isSelected && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(to top, rgba(49,46,129,0.9), transparent)',
                    padding: '0.5rem 0.75rem', pointerEvents: 'none',
                  }}>
                    <span style={{ fontSize: '0.75rem', color: '#a5b4fc' }}>Tu voto</span>
                  </div>
                )}
              </div>

              {/* Nombre + botón Seleccionar */}
              <div style={{ padding: '0.625rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{
                  fontSize: '0.8125rem', fontWeight: 500,
                  color: 'rgba(255,255,255,0.9)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0,
                }}>
                  {p.name}
                </p>

                {/* Botón "Seleccionar" — visible solo en móvil (oculto en sm+) */}
                {!hasVoted && (
                  <button
                    type="button"
                    onClick={() => handleSelect(p.id)}
                    style={{
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent',
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      border: isSelected
                        ? '1px solid rgba(99,102,241,0.5)'
                        : '1px solid rgba(255,255,255,0.1)',
                      background: isSelected
                        ? 'rgba(99,102,241,0.15)'
                        : 'rgba(255,255,255,0.04)',
                      color: isSelected ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    } as React.CSSProperties}
                    className="sm:hidden"
                  >
                    {isSelected ? '✓ Seleccionado' : 'Seleccionar'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Panel de confirmación */}
      {!hasVoted && (
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <p style={{
            fontSize: '0.875rem', color: '#6b6b8a', textAlign: 'center',
            fontFamily: 'monospace', letterSpacing: '0.05em', minHeight: '1.25rem',
          }}>
            {selectedParticipant
              ? `Seleccionaste: ${glitchText}`
              : 'Ninguna foto seleccionada'}
          </p>

          <button
            type="button"
            onClick={handleVote}
            disabled={!selected || loading}
            style={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              width: '100%', maxWidth: '20rem',
              padding: '0.875rem 1.5rem',
              borderRadius: '1rem',
              border: 'none',
              background: selected && !loading ? '#4f46e5' : 'rgba(255,255,255,0.05)',
              color: selected && !loading ? 'white' : 'rgba(255,255,255,0.25)',
              fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.05em',
              cursor: selected && !loading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: selected && !loading ? '0 4px 24px rgba(79,70,229,0.35)' : 'none',
            } as React.CSSProperties}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span style={{
                  width: '1rem', height: '1rem',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white', borderRadius: '50%',
                  display: 'inline-block', animation: 'spin 0.7s linear infinite',
                }} />
                Enviando...
              </span>
            ) : 'Confirmar voto →'}
          </button>
        </div>
      )}

      {/* Ya votó */}
      {hasVoted && !success && (
        <div style={{
          marginTop: '2rem', textAlign: 'center', color: '#34d399',
          fontSize: '0.875rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
        }}>
          <span>✓</span> Ya votaste en esta categoría.
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
            touchAction: 'manipulation',
          }}
        >
          <img
            src={lightboxUrl}
            alt="Foto ampliada"
            style={{
              maxWidth: '100%', maxHeight: '90vh', borderRadius: '1rem',
              objectFit: 'contain', boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              pointerEvents: 'none',
            }}
          />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightboxUrl(null) }}
            style={{
              position: 'absolute', top: '1rem', right: '1rem',
              width: '2.5rem', height: '2.5rem', borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
              color: 'white', fontSize: '1.25rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              touchAction: 'manipulation',
            } as React.CSSProperties}
          >
            ×
          </button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}