import { createClient } from "@/lib/supabase/server";
import { getMockDeal } from "@/lib/mock-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";

export const revalidate = 60;

const isMockMode = !hasSupabaseEnv;

function formatFollowers(value: number | null | undefined) {
  if (!value || value <= 0) return null;
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return `${value}`;
}

function getDealRequirements(deal: any) {
  const minFollowers = deal.min_followers ?? null;
  const igFeed = deal.min_ig_feed_posts ?? 0;
  const igStories = deal.min_ig_stories ?? 0;
  const tiktok = deal.min_tiktok_posts ?? 0;

  return {
    minFollowers,
    igFeed,
    igStories,
    tiktok,
    reward: deal.permuta_reward || "Experiencia da casa para creators",
  };
}

interface DealPageProps {
  params: Promise<{ id: string }>;
}

export default async function DealPage({ params }: DealPageProps) {
  const { id } = await params;
  let deal: any = null;

  if (isMockMode) {
    deal = getMockDeal(id);
  } else {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("deals")
      .select(
        `*, restaurant:restaurants (
          id, name, description, category, address, image_url, instagram_handle
        )`
      )
      .eq("id", id)
      .single();

    if (!error) deal = data;
  }

  if (!deal) notFound();
  const requirements = getDealRequirements(deal);

  const daysMap: Record<string, string> = {
    monday: "Seg",
    tuesday: "Ter",
    wednesday: "Qua",
    thursday: "Qui",
    friday: "Sex",
    saturday: "Sab",
    sunday: "Dom",
  };

  return (
    <div className="app-shell pb-24">
      <header className="top-nav">
        <div className="nav-inner">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary">
            <span aria-hidden>←</span>
            Voltar
          </Link>
          <BrandLogo priority />
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-5 px-4 py-5 md:py-7">
        <section className="deal-card overflow-hidden">
          <div className="deal-image-wrap h-72 md:h-80">
            <Image
              src={deal.image_url || deal.restaurant.image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"}
              alt={deal.title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
            <div className="deal-image-overlay" />

            <div className="absolute left-4 top-4 badge-discount">
              {formatFollowers(requirements.minFollowers)
                ? `${formatFollowers(requirements.minFollowers)}+ seguidores`
                : "Sem minimo de seguidores"}
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4 text-white md:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/75">{deal.restaurant.category}</p>
              <h1 className="mt-2 text-2xl font-semibold md:text-4xl">{deal.title}</h1>
              <p className="mt-2 text-sm text-white/90">{deal.restaurant.name}</p>
            </div>
          </div>

          <div className="space-y-5 p-5 md:p-6">
            <p className="text-sm leading-relaxed text-slate-600 md:text-base">{deal.description}</p>

            <div className="rounded-2xl border border-primary/10 bg-primary/[0.05] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Permuta oferecida</p>
              <p className="mt-2 text-sm font-medium text-slate-700">{requirements.reward}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Vagas</p>
                <p className="mt-1 text-xl font-semibold text-primary">{deal.available_spots}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Min seguidores</p>
                <p className="mt-1 text-xl font-semibold text-primary">
                  {formatFollowers(requirements.minFollowers)
                    ? `${formatFollowers(requirements.minFollowers)}+`
                    : "Livre"}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Feed IG</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {requirements.igFeed || 0} posts
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">TikTok</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {requirements.tiktok || 0} posts
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
              Stories minimos: <span className="font-semibold text-slate-800">{requirements.igStories || 0}</span>
              <span className="mx-2">•</span>
              Validade ate <span className="font-semibold text-slate-800">{format(new Date(deal.valid_until), "dd MMM", { locale: ptBR })}</span>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">Dias disponiveis</p>
              <div className="flex flex-wrap gap-2">
                {deal.days_available?.map((day: string) => (
                  <span key={day} className="chip">
                    {daysMap[day] || day}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="card space-y-4 p-5 md:p-6">
          <p className="text-lg font-semibold text-slate-900">Sobre o restaurante</p>

          <div className="flex items-start gap-3">
            {deal.restaurant.image_url && (
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl">
                <Image src={deal.restaurant.image_url} alt={deal.restaurant.name} fill className="object-cover" unoptimized />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-slate-900">{deal.restaurant.name}</p>
              <p className="text-sm text-slate-500">{deal.restaurant.category}</p>
              {deal.restaurant.instagram_handle && (
                <a
                  href={`https://instagram.com/${deal.restaurant.instagram_handle.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm font-semibold text-primary"
                >
                  {deal.restaurant.instagram_handle}
                </a>
              )}
            </div>
          </div>

          {deal.restaurant.description && <p className="text-sm text-slate-600">{deal.restaurant.description}</p>}
          {deal.restaurant.address && <p className="glass-note">{deal.restaurant.address}</p>}
        </section>
      </main>

      <div className="sticky-action-bar">
        <div className="mx-auto max-w-4xl">
          <Link href={`/book/${deal.id}`} className="btn-primary w-full">
            Quero me candidatar
          </Link>
        </div>
      </div>
    </div>
  );
}
