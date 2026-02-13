import { createClient } from "@/lib/supabase/server";
import { getMockDeal } from "@/lib/mock-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookingForm from "@/components/BookingForm";
import BrandLogo from "@/components/BrandLogo";
import AuthNav from "@/components/AuthNav";

const isMockMode = !hasSupabaseEnv;

function formatFollowers(value: number | null | undefined) {
  if (!value || value <= 0) return null;
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return `${value}`;
}

interface BookingPageProps {
  params: Promise<{ dealId: string }>;
  searchParams: Promise<{ error?: string }>;
}

const errorMessages: Record<string, string> = {
  no_spots: "Nao ha vagas disponiveis para esta permuta no momento.",
  invalid_party_size: "A quantidade de pessoas selecionada nao e valida para esta permuta.",
  deal_not_found: "Esta permuta nao esta mais disponivel.",
  failed: "Nao foi possivel enviar sua candidatura. Tente novamente.",
};

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
  const { dealId } = await params;
  const { error } = await searchParams;

  let deal: any = null;
  let applicant: { name: string; email: string; phone: string } | null = null;
  let isAuthenticated = false;
  let isInstagramConnected = false;

  if (isMockMode) {
    deal = getMockDeal(dealId);
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    isAuthenticated = Boolean(user);

    if (user) {
      const { data: profile } = await supabase
        .from("creator_profiles")
        .select("full_name, phone")
        .eq("user_id", user.id)
        .maybeSingle();

      const { data: social } = await supabase
        .from("creator_social_accounts")
        .select("id")
        .eq("user_id", user.id)
        .eq("provider", "instagram")
        .eq("connected", true)
        .maybeSingle();

      isInstagramConnected = Boolean(social);

      applicant = {
        name:
          (profile?.full_name as string | undefined) ||
          (user.user_metadata?.full_name as string | undefined) ||
          (user.user_metadata?.name as string | undefined) ||
          (user.user_metadata?.display_name as string | undefined) ||
          "",
        email: user.email || "",
        phone: (profile?.phone as string | undefined) || (user.phone as string | undefined) || "",
      };
    }

    const { data, error } = await supabase
      .from("deals")
      .select("*, restaurant:restaurants (id, name, category, image_url)")
      .eq("id", dealId)
      .single();
    if (!error) deal = data;
  }

  if (!deal) notFound();

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="nav-inner">
          <Link href={`/deal/${deal.id}`} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary">
            <span aria-hidden>←</span>
            Oferta
          </Link>
          <div className="flex items-center gap-3">
            <BrandLogo priority />
            <AuthNav />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-5 md:space-y-5 md:py-7">
        <section className="deal-card p-4">
          <div className="flex gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl">
              {deal.restaurant.image_url ? (
                <Image src={deal.restaurant.image_url} alt={deal.restaurant.name} fill className="object-cover" unoptimized />
              ) : (
                <div className="h-full w-full bg-slate-100" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-lg font-semibold text-slate-900">{deal.title}</p>
              <p className="text-sm text-slate-500">{deal.restaurant.name}</p>
              <div className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {formatFollowers(deal.min_followers)
                  ? `${formatFollowers(deal.min_followers)}+ seguidores`
                  : "Sem minimo de seguidores"}
              </div>
            </div>
          </div>
        </section>

        {error && (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessages[error] ?? errorMessages.failed}
          </section>
        )}

        <BookingForm
          deal={deal}
          isMockMode={isMockMode}
          applicant={applicant}
          isAuthenticated={isAuthenticated}
          isInstagramConnected={isInstagramConnected}
          loginHref={`/login?next=${encodeURIComponent(`/book/${dealId}`)}`}
          connectInstagramHref={`/onboarding?next=${encodeURIComponent(`/book/${dealId}`)}`}
        />
      </main>
    </div>
  );
}
