'use client'
import { useEffect, useState } from 'react'
import type { Phase } from '../types'
import styles from './page.module.css'
const PHASE_LABELS: Record<Phase, string> = {
  1: 'Fase 1 — Votación Pública',
  2: 'Fase 2 — Selección Final',
  3: 'Resultados Finales',
}

const PHASE_ORDER: Phase[] = [1, 2, 3]

const PHASE_NEXT: Partial<Record<Phase, Phase>> = {
  1: 2,
  2: 3,
}


const PHASE_NEXT_LABEL: Partial<Record<Phase, string>> = {
  1: 'Cerrar votación y pasar a Fase 2',
  2: 'Publicar resultados finales',
}

export default function AdminDashboard() {
  const [phase, setPhase] = useState<Phase | null>(null)
  const [stats, setStats] = useState({ categories: 0, participants: 0, votes: 0 })
  const [loading, setLoading] = useState(true)
  const [advancing, setAdvancing] = useState(false)
  console.log('PHASE:', phase)
  useEffect(() => {
    async function load() {
      const [settingsRes, catsRes, partsRes] = await Promise.all([
        fetch('/api/admin/settings'),
        fetch('/api/categories'),
        fetch('/api/participants'),
      ])

      const settings = await settingsRes.json()
      const cats = await catsRes.json()
      const parts = await partsRes.json()

      setPhase(settings.current_phase)
      setStats({
        categories: cats.length ?? 0,
        participants: parts.length ?? 0,
        votes: 0,
      })

      setLoading(false)
    }

    load()
  }, [])

  async function advancePhase() {
    if (!phase || !PHASE_NEXT[phase]) return

    const next = PHASE_NEXT[phase]

    const confirmMsg =
      `¿Confirmas pasar a "${PHASE_LABELS[next!]}?" Esta acción no se puede deshacer.`

    if (!confirm(confirmMsg)) return

    setAdvancing(true)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_phase: next }),
      })

      if (!res.ok) throw new Error('Error al actualizar fase')

      const data = await res.json()

      // 🔥 fuente de verdad del backend
      setPhase(data.current_phase)

    } catch (err) {
      console.error(err)
      alert('No se pudo cambiar la fase')
    } finally {
      setAdvancing(false)
    }
  }

  function isCompleted(p: Phase, current: Phase): boolean {
    return PHASE_ORDER.indexOf(p) < PHASE_ORDER.indexOf(current)
  }

  if (loading) return <div className={styles.loading}>Cargando...</div>

  return (
  <main className="min-h-screen bg-[#080810] text-white px-4 sm:px-6 py-10">
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Dashboard
        </h1>
        <p className="text-[#8b8ba8]">
          Resumen del concurso y control de fases
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          <span className="text-3xl font-bold">{stats.categories}</span>
          <p className="text-sm text-[#8b8ba8] mt-1">Categorías</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          <span className="text-3xl font-bold">{stats.participants}</span>
          <p className="text-sm text-[#8b8ba8] mt-1">Participantes</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          <span className="text-lg font-semibold">
            {phase ? PHASE_LABELS[phase] : '—'}
          </span>
          <p className="text-sm text-[#8b8ba8] mt-1">Fase actual</p>
        </div>
      </div>

      {/* Phase control */}
      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-6">
          Control de Fase
        </h2>

        {/* Timeline */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {PHASE_ORDER.map((p, i) => {
            const active = phase === p
            const completed = phase && isCompleted(p, phase)

            return (
              <div
                key={p}
                className={`flex-1 flex items-center gap-3 p-3 rounded-xl border transition
                  ${active ? 'border-indigo-500 bg-indigo-500/10' : ''}
                  ${completed ? 'border-green-500 bg-green-500/10' : 'border-white/10'}
                `}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold
                  ${completed ? 'bg-green-500 text-white' : ''}
                  ${active ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/60'}
                `}>
                  {completed ? '✓' : i + 1}
                </div>

                <span className="text-sm">
                  {PHASE_LABELS[p]}
                </span>
              </div>
            )
          })}
        </div>

        {/* Button */}
        {phase && PHASE_NEXT[phase] && (
          <button
            onClick={advancePhase}
            disabled={advancing}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition
              ${advancing
                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
              }`}
          >
            {advancing
              ? 'Procesando...'
              : PHASE_NEXT_LABEL[phase]}
          </button>
        )}

        {phase === 3 && (
          <p className="text-green-400 text-sm mt-4">
            ✓ Concurso finalizado
          </p>
        )}
      </div>
    </div>
  </main>
)}