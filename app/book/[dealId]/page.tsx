import { createClient } from "@/lib/supabase/server";
import { getMockDeal } from "@/lib/mock-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { notFound } from "next/navigation";
import BookingForm from "@/components/BookingForm";

const isMockMode = !hasSupabaseEnv;

interface BookingPageProps {
  params: Promise<{ dealId: string }>;
  searchParams: Promise<{ error?: string }>;
}

const errorMessages: Record<string, string> = {
  no_spots: "Não há vagas disponíveis para esta oferta no momento.",
  invalid_party_size: "A quantidade de pessoas selecionada não é válida para esta oferta.",
  deal_not_found: "Esta oferta não está mais disponível.",
  failed: "Não foi possível concluir sua reserva. Tente novamente.",
};

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
  const { dealId } = await params;
  const { error } = await searchParams;

  let deal: any = null;

  if (isMockMode) {
    deal = getMockDeal(dealId);
  } else {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("deals")
      .select(
        `*, restaurant:restaurants (id, name, category, image_url)`
      )
      .eq("id", dealId)
      .single();
    if (!error) deal = data;
  }

  if (!deal) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <a href={`/deal/${deal.id}`} className="text-gray-600 hover:text-gray-900 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <h1 className="text-xl font-bold">Concluir reserva</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Deal Summary Card */}
        <div className="card p-4 mb-6">
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
              {deal.restaurant.image_url && (
                <img
                  src={deal.restaurant.image_url}
                  alt={deal.restaurant.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg line-clamp-1">{deal.title}</h2>
              <p className="text-sm text-gray-600">{deal.restaurant.name}</p>
              {deal.discount_percentage && (
                <span className="badge-discount text-xs mt-1 inline-block">
                  {deal.discount_percentage}% OFF
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Booking Form */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessages[error] ?? errorMessages.failed}
          </div>
        )}
        <BookingForm deal={deal} isMockMode={isMockMode} />
      </main>
    </div>
  );
}
