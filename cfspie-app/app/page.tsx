import { createSupabaseAdminClient } from "./lib/supabase";
import { Category, Settings } from "./types";
import CategoryGrid from "./components/voting/CategoryGrid";
import Phasebanner from "./components/ui/Phasebanner";

export const revalidate = 30;

async function getData() {
  const supabase = createSupabaseAdminClient();

  const [{ data: categories }, { data: settings }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order"),
    supabase.from("settings").select("*").single(),
  ]);

  return {
    categories: (categories as Category[]) ?? [],
    settings: settings as Settings | null,
  };
}

export default async function HomePage() {
  const { categories, settings } = await getData();
  const phase = settings?.current_phase ?? 1;

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#080810]">
      {/* ── Hero ── */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px]
                        bg-indigo-700/10 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                          bg-indigo-600/15 border border-indigo-500/25
                          text-indigo-400 text-xs font-medium mb-7 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse flex-shrink-0" />
            Grupo Estudiantil SPIE
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.08]">
            <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              Concurso de
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
              Fotografía
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[#6b6b8a] max-w-lg mx-auto mb-9 leading-relaxed">
            Explora las categorías, descubre las mejores fotos y vota por tus favoritas.
          </p>

          {/* Phase banner */}
          <div className="flex justify-center">
            <Phasebanner phase={phase} />
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      </div>

      {/* ── Categories ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-white/90">Categorías</h2>
          <span className="text-xs text-[#6b6b8a]">
            {categories.length} categoría{categories.length !== 1 ? "s" : ""}
          </span>
        </div>

        <CategoryGrid categories={categories} phase={phase} />
      </section>
    </main>
  );
}