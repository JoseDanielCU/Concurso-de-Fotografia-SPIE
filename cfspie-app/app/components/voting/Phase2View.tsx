import type { VoteCount } from '../../types'

interface Props {
  participants: VoteCount[]
  finalistsCount?: number
}

export default function Phase2View({ participants, finalistsCount }: Props) {
  const finalists = participants.filter((p) => p.is_finalist)

  if (finalists.length === 0) {
    return (
      <div className="text-center py-20 text-[#6b6b8a]">
        <span className="block text-5xl mb-4 opacity-20">◈</span>
        <p>Los finalistas serán anunciados pronto.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 text-center sm:text-left">
        <span className="inline-block px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/25
                         text-violet-400 text-xs font-semibold tracking-widest uppercase mb-3">
          Fase Final
        </span>
        <p className="text-sm text-[#6b6b8a]">
          {finalistsCount
            ? `Los ${finalistsCount} finalistas seleccionados por votación popular`
            : 'Finalistas seleccionados por votación popular'}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {finalists.map((p, i) => (
          <div
            key={p.participant_id}
            className="group relative rounded-2xl overflow-hidden bg-[#0e0e1a]
                       border border-white/[0.06] hover:border-violet-500/30
                       transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Rank badge */}
            <div className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-black/70 backdrop-blur-sm
                            flex items-center justify-center text-xs font-bold text-white/80 border border-white/10">
              #{i + 1}
            </div>

            {/* Image */}
            <div className="relative aspect-square overflow-hidden">
              <img
                src={p.photo_url}
                alt={p.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="text-sm font-semibold text-white truncate mb-1">{p.name}</p>
              <p className="text-xs text-[#6b6b8a]">
                {p.vote_count} {p.vote_count === 1 ? 'voto' : 'votos'} en fase 1
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}