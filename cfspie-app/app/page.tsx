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
    <main className="min-h-screen w-full overflow-x-hidden bg-[#0a0a0f] flex flex-col items-center">
      {/* Hero Section - Versión más robusta contra superposiciones y desapariciones */}
      <section className="relative pt-24 md:pt-28 pb-12 md:pb-20 px-4 sm:px-6 overflow-hidden">

        {/* Fondo degradado sutil */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-transparent to-transparent pointer-events-none" />

        {/* Orb decorativo (más pequeño y controlado) */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[320px] h-[200px] sm:w-[480px] sm:h-[260px] md:w-[620px] md:h-[320px]
                        bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Contenido principal - z-index alto para que NO se tape */}
        <div className="relative z-20 max-w-5xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Grupo Estudiantil SPIE
          </div>

          {/* Título - más visible y responsive */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 leading-[1.05]
                         bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent">
            Concurso de Fotografía
          </h1>

          {/* Descripción */}
          <p className="text-base sm:text-lg text-[#8b8ba8] max-w-2xl mx-auto mb-10 px-4">
            Explora las categorías, descubre las mejores fotos y vota por tus favoritas.
          </p>

          {/* Phasebanner centrado */}
          <div className="flex justify-center">
            <Phasebanner phase={phase} />
          </div>
        </div>
      </section>

      {/* Sección de Categorías - Aseguramos que use todo el ancho disponible */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-24 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white/90">Categorías</h2>
          <span className="text-sm text-[#8b8ba8] whitespace-nowrap">
            {categories.length} categoría{categories.length !== 1 ? "s" : ""}
          </span>
        </div>

        <CategoryGrid categories={categories} phase={phase} />
      </section>
    </main>
  );
}