'use client'
import { useEffect, useState } from 'react'
import type { Phase } from '../types'
import styles from './page.module.css'
const PHASE_LABELS: Record<Phase, string> = {
  1: 'Fase 1 — Votación Pública',
  2: 'Fase 2 — Selección Final',
  results: 'Resultados Finales',
}

const PHASE_ORDER: Phase[] = [1, 2, 'results']

const PHASE_NEXT: Partial<Record<Phase, Phase>> = {
  1: 2,
  2: 'results',
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
    <div>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Resumen del concurso y control de fases</p>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.categories}</span>
          <span className={styles.statLabel}>Categorías</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.participants}</span>
          <span className={styles.statLabel}>Participantes</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statValue}>
            {phase ? PHASE_LABELS[phase].split('—')[0] : '—'}
          </span>
          <span className={styles.statLabel}>Fase actual</span>
        </div>
      </div>

      <div className={styles.phaseCard}>
        <h2>Control de Fase</h2>

        <div className={styles.phaseTimeline}>
          {PHASE_ORDER.map((p, i) => (
            <div
              key={p}
              className={`${styles.timelineStep} ${
                phase === p ? styles.active : ''
              } ${phase && isCompleted(p, phase) ? styles.completed : ''}`}
            >
              <div className={styles.timelineDot}>
                {phase && isCompleted(p, phase) ? '✓' : i + 1}
              </div>
              <span>{PHASE_LABELS[p]}</span>
            </div>
          ))}
        </div>

        {phase && PHASE_NEXT[phase] && (
          <button
            className="btn btn-primary"
            onClick={advancePhase}
            disabled={advancing}
          >
            {advancing
              ? 'Procesando...'
              : PHASE_NEXT_LABEL[phase]}
          </button>
        )}

        {phase === 'results' && (
          <p>✓ Concurso finalizado</p>
        )}
      </div>
    </div>
  )
}