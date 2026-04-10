'use client'
import type { Phase } from '../../types'

interface Props {
  phase: Phase
}

const phaseConfig = {
  phase1: {
    label: 'Fase 1 — Votación Pública',
    desc: 'Vota por tu foto favorita en cada categoría. Solo puedes votar una vez por categoría.',
    dot: 'bg-indigo-400',
    border: 'border-indigo-500/25',
    bg: 'bg-indigo-500/8',
    text: 'text-indigo-300',
    desc_text: 'text-indigo-200/60',
  },
  phase2: {
    label: 'Fase 2 — Selección Final',
    desc: 'La votación pública ha cerrado. El jurado está seleccionando los ganadores finales.',
    dot: 'bg-violet-400',
    border: 'border-violet-500/25',
    bg: 'bg-violet-500/8',
    text: 'text-violet-300',
    desc_text: 'text-violet-200/60',
  },
  results: {
    label: 'Resultados Finales',
    desc: '¡El concurso ha concluido! Conoce los ganadores de cada categoría.',
    dot: 'bg-amber-400',
    border: 'border-amber-500/25',
    bg: 'bg-amber-500/8',
    text: 'text-amber-300',
    desc_text: 'text-amber-200/60',
  },
} as const

const phaseMap: Record<string | number, keyof typeof phaseConfig> = {
  1: 'phase1',
  2: 'phase2',
  3: 'results',
  results: 'results',
}

export default function Phasebanner({ phase }: Props) {
  const key = phaseMap[phase as string | number]
  const config = key ? phaseConfig[key] : null

  if (!config) return null

  return (
    <div
      className={[
        'inline-flex items-start gap-3 px-5 py-3.5 rounded-2xl border',
        'backdrop-blur-sm max-w-md text-left',
        config.bg,
        config.border,
      ].join(' ')}
    >
      {/* Pulsing dot */}
      <div className="mt-0.5 flex-shrink-0 relative">
        <span className={`block w-2 h-2 rounded-full ${config.dot}`} />
        <span
          className={`absolute inset-0 w-2 h-2 rounded-full ${config.dot} animate-ping opacity-60`}
        />
      </div>

      <div>
        <p className={`text-sm font-semibold ${config.text}`}>{config.label}</p>
        <p className={`text-xs mt-0.5 leading-relaxed ${config.desc_text}`}>{config.desc}</p>
      </div>
    </div>
  )
}