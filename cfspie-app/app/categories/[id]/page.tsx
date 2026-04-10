import { createSupabaseAdminClient } from "../../lib/supabase";
import {Category, Phase, Settings, VoteCount} from "../../types";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import VotingGrid from "../../components/voting/VotingGrid";
import Phase2View from "../../components/voting/Phase2View";
import ResultsView from "../../components/results/ResultView";
import SiteHeader from "../../components/ui/SiteHeader";

export const revalidate = 15;

interface PageProps {
  params: { id: string };
}

async function getData(id: string) {
  const supabase = createSupabaseAdminClient();

  const [{ data: category }, { data: settings }, { data: voteCounts }] =
    await Promise.all([
      supabase.from("categories").select("*").eq("id", id).single(),
      supabase.from("settings").select("*").single(),
      supabase
        .from("participants")
.select("*")
.eq("category_id", id)
    ]);

  return {
    category: category as Category | null,
    settings: settings as Settings | null,
    voteCounts: (voteCounts as VoteCount[]) ?? [],
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const resolvedParams = await params
  const { category, settings, voteCounts } = await getData(resolvedParams.id)

  if (!category || !category.is_active) notFound()

  const phase = settings?.current_phase
  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <SiteHeader />

      <div className="max-w-6xl mx-auto px-4 pt-24 pb-24">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#8b8ba8] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Volver a categorías
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-[#8b8ba8] text-lg">{category.description}</p>
          )}
          <div className="mt-4 flex items-center gap-4 text-sm text-[#5a5a78]">
            <span>{voteCounts.length} participante{voteCounts.length !== 1 ? "s" : ""}</span>
            {phase === 1 &&  (
              <span>
                Top {category.phase1_finalists_count} pasan a la siguiente fase
              </span>
            )}
          </div>
        </div>

        {/* Content based on phase */}
        {phase === 1 && (
          <VotingGrid
            participants={voteCounts}
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