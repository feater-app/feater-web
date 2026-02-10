import { createClient } from "@/lib/supabase/server";
import { mockDeals } from "@/lib/mock-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import FeedFilters from "@/components/FeedFilters";
import BrandLogo from "@/components/BrandLogo";

export const revalidate = 60;

const isMockMode = !hasSupabaseEnv;

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    platform?: string;
    followers?: string;
    day?: string;
  }>;
}

interface Filters {
  q: string;
  platform: "instagram" | "tiktok" | "";
  followers: number | null;
  day: string;
}

function formatFollowers(value: number | null | undefined) {
  if (!value || value <= 0) return null;
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return `${value}`;
}

function getDealRequirements(deal: any) {
  const minFollowers = deal.min_followers ?? null;
  const feedPosts = deal.min_ig_feed_posts ?? 0;
  const stories = deal.min_ig_stories ?? 0;
  const tiktokPosts = deal.min_tiktok_posts ?? 0;

  const deliverables = [
    feedPosts > 0 ? `${feedPosts} feed IG` : null,
    stories > 0 ? `${stories} stories` : null,
    tiktokPosts > 0 ? `${tiktokPosts} TikTok` : null,
  ].filter(Boolean);

  return {
    minFollowers,
    reward: deal.permuta_reward || "Experiencia da casa para creators",
    deliverables: deliverables.length > 0 ? deliverables.join(" + ") : "Briefing alinhado com o restaurante",
    hasInstagram: feedPosts > 0 || stories > 0,
    hasTikTok: tiktokPosts > 0,
  };
}

function parseFilters(raw: { q?: string; platform?: string; followers?: string; day?: string }): Filters {
  const parsedFollowers = raw.followers ? Number(raw.followers) : NaN;
  const platform = raw.platform === "instagram" || raw.platform === "tiktok" ? raw.platform : "";

  return {
    q: (raw.q || "").trim(),
    platform,
    followers: Number.isFinite(parsedFollowers) && parsedFollowers > 0 ? parsedFollowers : null,
    day: raw.day || "",
  };
}

function dealMatchesFilters(deal: any, filters: Filters) {
  const requirements = getDealRequirements(deal);

  if (filters.platform === "instagram" && !requirements.hasInstagram) return false;
  if (filters.platform === "tiktok" && !requirements.hasTikTok) return false;
  if (filters.followers && (deal.min_followers ?? 0) < filters.followers) return false;
  if (filters.day && !(deal.days_available || []).includes(filters.day)) return false;

  if (filters.q) {
    const q = filters.q.toLowerCase();
    const haystack = [
      deal.title,
      deal.description,
      deal.permuta_reward,
      deal.restaurant?.name,
      deal.restaurant?.category,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (!haystack.includes(q)) return false;
  }

  return true;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const filters = parseFilters(await searchParams);
  let allDeals: any[] = [];

  if (isMockMode) {
    allDeals = mockDeals;
  } else {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("deals")
      .select(
        `
        *,
        restaurant:restaurants (
          id, name, category, image_url, instagram_handle
        )
      `
      )
      .eq("active", true)
      .gte("valid_until", new Date().toISOString().split("T")[0])
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching deals:", error);
    allDeals = data ?? [];
  }

  const deals = allDeals.filter((deal) => dealMatchesFilters(deal, filters));
  const hasActiveFilters = Boolean(filters.q || filters.platform || filters.followers || filters.day);

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="nav-inner">
          <BrandLogo priority />
          <span className="rounded-full border border-primary/15 bg-white px-3 py-1 text-[11px] font-semibold text-primary">
            Sao Paulo
          </span>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 md:gap-6 md:py-7">
        <section className="hero-surface">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">Feater curadoria</p>
          <h1 className="mt-2 max-w-[22ch] text-2xl font-semibold leading-tight md:text-4xl">
            Permutas para creators com restaurantes em alta
          </h1>
          <p className="mt-3 max-w-[38ch] text-sm text-white/90 md:text-base">
            O local oferece experiencia completa e voce entrega conteudo em Instagram e TikTok.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2 md:max-w-xl md:gap-3">
            <div className="metric-pill">
              <p className="text-lg font-bold text-white">{deals.length}</p>
              <p>resultados</p>
            </div>
            <div className="metric-pill">
              <p className="text-lg font-bold text-white">{allDeals.length}</p>
              <p>permutas ativas</p>
            </div>
            <div className="metric-pill">
              <p className="text-lg font-bold text-white">24h</p>
              <p>resposta media</p>
            </div>
          </div>
        </section>

        <FeedFilters
          initialQuery={filters.q}
          initialPlatform={filters.platform}
          initialFollowers={filters.followers}
          initialDay={filters.day}
        />

        {deals.length > 0 ? (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal: any) => {
              const requirements = getDealRequirements(deal);

              return (
                <Link key={deal.id} href={`/deal/${deal.id}`} className="deal-card group">
                  <div className="deal-image-wrap">
                    <Image
                      src={deal.image_url || deal.restaurant.image_url || "/placeholder.jpg"}
                      alt={deal.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="deal-image-overlay" />

                    <div className="absolute left-3 top-3 badge-discount">
                      {formatFollowers(requirements.minFollowers)
                        ? `${formatFollowers(requirements.minFollowers)}+ seguidores`
                        : "Sem minimo de seguidores"}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">{deal.restaurant.category}</p>
                      <h2 className="mt-1 line-clamp-1 text-lg font-semibold">{deal.title}</h2>
                      <p className="line-clamp-1 text-sm text-white/85">{deal.restaurant.name}</p>
                    </div>
                  </div>

                  <div className="space-y-4 p-4">
                    <p className="line-clamp-2 text-sm text-slate-600">{deal.description || "Permuta por tempo limitado"}</p>

                    <div className="rounded-2xl border border-primary/10 bg-primary/[0.04] px-3 py-2 text-xs text-slate-600">
                      <p className="font-semibold text-primary">Em troca: {requirements.reward}</p>
                      <p className="mt-1 text-slate-500">Entrega: {requirements.deliverables}</p>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
                      <span>{deal.available_spots} vagas para creators</span>
                      <span>Ate {format(new Date(deal.valid_until), "dd MMM", { locale: ptBR })}</span>
                    </div>

                    <span className="btn-primary w-full">Quero dar feat</span>
                  </div>
                </Link>
              );
            })}
          </section>
        ) : (
          <section className="card px-6 py-12 text-center">
            <p className="text-base font-semibold text-slate-700">Nenhuma permuta encontrada</p>
            <p className="mt-2 text-sm text-slate-500">Ajuste os filtros ou limpe a busca para ver mais oportunidades.</p>
            {hasActiveFilters && (
              <div className="mt-4">
                <Link href="/" className="btn-secondary">
                  Limpar filtros
                </Link>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
