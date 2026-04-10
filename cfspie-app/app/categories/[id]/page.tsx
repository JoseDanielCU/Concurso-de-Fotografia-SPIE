import { createSupabaseAdminClient } from "../../lib/supabase";
import { Category, Settings, VoteCount, Participant } from "../../types";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import VotingGrid from "../../components/voting/VotingGrid";
import Phase2View from "../../components/voting/Phase2View";
import ResultsView from "../../components/results/ResultView";

export const revalidate = 15;

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getData(id: string) {
  const supabase = createSupabaseAdminClient();

  const [{ data: category }, { data: settings }, { data: rawParticipants }] =
    await Promise.all([
      supabase.from("categories").select("*").eq("id", id).single(),
      supabase.from("settings").select("*").single(),
      supabase.from("participants").select("*").eq("category_id", id),
    ]);

  const participants: Participant[] = rawParticipants ?? [];

  // 🔥 Generamos VoteCount compatible para fases 2 y results
  const voteCounts: VoteCount[] = (rawParticipants ?? []).map((p: any) => ({
    participant_id: p.id,
    name: p.name,
    photo_url: p.photo_url,
    category_id: p.category_id,
    is_finalist: p.is_finalist ?? false,
    is_phase2_winner: p.is_phase2_winner ?? false,
    category_name: category?.name ?? "",
    category_slug: category?.slug ?? "",
    vote_count: 0, // placeholder (puedes reemplazar con query real)
  }));

  return {
    category: category as Category | null,
    settings: settings as Settings | null,
    participants,
    voteCounts,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { id } = await params;

  const { category, settings, participants, voteCounts } = await getData(id);

  if (!category || !category.is_active) notFound();

  const phase = settings?.current_phase;

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#080810]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-20 sm:pb-28">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#6b6b8a]
                     hover:text-white transition-colors mb-8 sm:mb-10
                     group"
        >
          <ArrowLeft
            size={15}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          Volver a categorías
        </Link>

        {/* Header */}
        <div className="mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {category.name}
          </h1>

          {category.description && (
            <p className="text-[#6b6b8a] text-base sm:text-lg max-w-2xl">
              {category.description}
            </p>
          )}

          {/* Meta */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#6b6b8a]">
              {participants.length} participante{participants.length !== 1 ? "s" : ""}
            </span>

            {phase === 1 && category.phase1_finalists_count && (
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400">
                Top {category.phase1_finalists_count} pasan a la siguiente fase
              </span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-white/10 to-transparent mb-10" />

        {/* Phase content */}
        {phase === 1 && (
          <VotingGrid
            participants={participants}
            categoryId={category.id}
            hasVoted={false}
          />
        )}

        {phase === 2 && (
          <Phase2View
            participants={voteCounts}
            finalistsCount={category.phase1_finalists_count}
          />
        )}

        {phase === "results" && (
          <ResultsView
            participants={voteCounts}
            finalistsCount={category.phase1_finalists_count}
          />
        )}
      </div>
    </main>
  );
}