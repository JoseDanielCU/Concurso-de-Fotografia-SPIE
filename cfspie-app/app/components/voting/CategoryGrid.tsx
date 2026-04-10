'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Category, Phase } from '../../types'
import { getVotedCategories } from '../../lib/voter'

interface Props {
  categories: Category[]
  phase: Phase
}

export default function CategoryGrid({ categories, phase }: Props) {
  const [votedCategories, setVotedCategories] = useState<string[]>([])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVotedCategories(getVotedCategories())
  }, [])

  if (categories.length === 0) {
    return (
      <div className="text-center py-20 text-[#8b8ba8]">
        <span className="block text-6xl mb-4 text-white/30">◈</span>
        <p className="text-lg">No hay categorías disponibles aún.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {categories.map((cat, i) => {
        const hasVoted = votedCategories.includes(cat.id)

        return (
          <Link
            key={cat.id}
            href={`/categories/${cat.id}`}
            className="group block bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden
                       transition-all duration-300 hover:border-indigo-500/50 hover:-translate-y-2
                       hover:shadow-2xl hover:shadow-black/60"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Imagen */}
            <div className="relative aspect-4/3 overflow-hidden bg-black">
              {cat.cover_image_url ? (
                <img
                  src={cat.cover_image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-[#1a1a24] flex items-center justify-center text-6xl text-white/20">
                  ◈
                </div>
              )}

              {/* Overlay degradado */}
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

              {/* Badge de voto */}
              {phase === 1 && (
                <div
                  className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-[10px] font-semibold tracking-widest uppercase transition-all
                    ${hasVoted 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-indigo-600 text-white'
                    }`}
                >
                  {hasVoted ? '✓ Votado' : 'Votar'}
                </div>
              )}
            </div>

            {/* Contenido */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 font-serif tracking-tight">
                {cat.name}
              </h3>

              {cat.description && (
                <p className="text-sm text-[#8b8ba8] line-clamp-3 mb-4 leading-relaxed">
                  {cat.description}
                </p>
              )}

              <span className="inline-block text-xs font-medium text-indigo-400 tracking-wider group-hover:text-indigo-300 transition-colors">
                {phase === 1 && !hasVoted && 'Ver fotos y votar →'}
                {phase === 1 && hasVoted && 'Ver tu voto →'}
                {phase === 2 && 'Ver finalistas →'}
                {phase === 'results' && 'Ver ganador →'}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}