'use client'
import type { Phase } from '../../types'
import styles from './PhaseBanner.module.css'

interface Props {
  phase: Phase
}

const phaseInfo: Record<Phase, { label: string; desc: string; class: string }> = {
  1: {
    label: 'Fase 1 — Votación Pública',
    desc: 'Vota por tu foto favorita en cada categoría. Solo puedes votar una vez por categoría.',
    class: 'phase1',
  },
  2: {
    label: 'Fase 2 — Selección Final',
    desc: 'La votación pública ha cerrado. El jurado está seleccionando los ganadores finales.',
    class: 'phase2',
  },
  results: {
    label: 'Resultados Finales',
    desc: 'El concurso ha concluido. ¡Conoce los ganadores de cada categoría!',
    class: 'results',
  },
}

const phaseMap = {
  1: 'phase1',
  2: 'phase2',
  3: 'results',
} as const

export default function Phasebanner({ phase }: Props) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const phaseKey = phaseMap[phase]
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const info = phaseInfo[phaseKey]

  if (!info) return null

  return (
    <div className={`${styles.banner} ${styles[info.class]}`}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.dot} />
        <div>
          <span className={styles.label}>{info.label}</span>
          <span className={styles.desc}>{info.desc}</span>
        </div>
      </div>
    </div>
  )
}