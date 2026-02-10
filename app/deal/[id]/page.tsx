import { createClient } from "@/lib/supabase/server";
import { getMockDeal } from "@/lib/mock-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60;

const isMockMode = !hasSupabaseEnv;

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold">Detalhes da oferta</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Hero Image */}
        <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-6 shadow-lg">
          <Image
            src={deal.image_url || deal.restaurant.image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"}
            alt={deal.title}
            fill
            className="object-cover"
            priority
            unoptimized
          />
          {deal.discount_percentage && (
            <div className="absolute top-4 right-4 badge-discount font-bold text-xl shadow-lg">
              {deal.discount_percentage}% OFF
            </div>
          )}
        </div>

        {/* Deal Info Card */}
        <div className="card p-6 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">{deal.title}</h2>
          <p className="text-gray-600 mb-6">{deal.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Vagas disponíveis</div>
              <div className="text-2xl font-bold text-primary">{deal.available_spots}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Máx. pessoas</div>
              <div className="text-2xl font-bold text-primary">{deal.max_people}</div>
            </div>
          </div>

          {/* Validity */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Período de validade</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {format(new Date(deal.valid_from), "dd 'de' MMM 'de' yyyy", { locale: ptBR })} —{" "}
                {format(new Date(deal.valid_until), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
          </div>

          {/* Available Days */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Dias disponíveis</h3>
            <div className="flex flex-wrap gap-2">
              {deal.days_available?.map((day: string) => (
                <span key={day} className="badge bg-primary/10 text-primary font-medium">
                  {daysMap[day] || day}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Restaurant Info Card */}
        <div className="card p-6">
          <h3 className="font-bold text-xl mb-4">Sobre o restaurante</h3>
          <div className="flex items-start gap-4 mb-4">
            {deal.restaurant.image_url && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={deal.restaurant.image_url}
                  alt={deal.restaurant.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-bold text-lg">{deal.restaurant.name}</h4>
              <p className="text-sm text-gray-500 mb-2">{deal.restaurant.category}</p>
              {deal.restaurant.instagram_handle && (
                <a
                  href={`https://instagram.com/${deal.restaurant.instagram_handle.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {deal.restaurant.instagram_handle}
                </a>
              )}
            </div>
          </div>

          {deal.restaurant.description && (
            <p className="text-gray-600 mb-4">{deal.restaurant.description}</p>
          )}

          {deal.restaurant.address && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{deal.restaurant.address}</span>
            </div>
          )}
        </div>
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
        <div className="max-w-4xl mx-auto">
          <Link href={`/book/${deal.id}`} className="btn-primary w-full block text-center">
            Reservar esta oferta
          </Link>
        </div>
      </div>
    </div>
  );
}
