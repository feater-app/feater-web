import { createClient } from "@/lib/supabase/server";
import { mockDeals } from "@/lib/mock-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60;

const isMockMode = !hasSupabaseEnv;

export default async function HomePage() {
  let deals: any[] = [];

  if (isMockMode) {
    deals = mockDeals;
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
    deals = data ?? [];
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">Feater</h1>
          <p className="text-sm text-gray-600">
            Descubra ofertas incríveis em restaurantes
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Bar */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl p-6 mb-6">
          <h2 className="text-3xl font-bold mb-2">
            {deals?.length || 0} ofertas disponíveis
          </h2>
          <p className="text-white/90">
            Economize enquanto apoia restaurantes locais
          </p>
        </div>

        {/* Deals Grid */}
        {deals && deals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal: any) => (
              <Link
                key={deal.id}
                href={`/deal/${deal.id}`}
                className="card overflow-hidden group"
              >
                {/* Deal Image */}
                <div className="relative h-48 bg-gray-200">
                  <Image
                    src={deal.image_url || deal.restaurant.image_url || "/placeholder.jpg"}
                    alt={deal.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                  {deal.discount_percentage && (
                    <div className="absolute top-3 right-3 badge-discount font-bold text-lg">
                      {deal.discount_percentage}% OFF
                    </div>
                  )}
                </div>

                {/* Deal Info */}
                <div className="p-4">
                  {/* Restaurant Name */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {deal.restaurant.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-1 line-clamp-1">
                    {deal.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {deal.description || "Oferta por tempo limitado"}
                  </p>

                  {/* Restaurant */}
                  <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="font-medium">{deal.restaurant.name}</span>
                  </div>

                  {/* Availability */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {deal.available_spots} vagas restantes
                    </span>
                    <span>
                      Até {format(new Date(deal.valid_until), "dd MMM", { locale: ptBR })}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <div className="px-4 pb-4">
                  <div className="btn-primary w-full text-center">
                    Reservar agora
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Nenhuma oferta disponível no momento
            </p>
            <p className="text-gray-400 text-sm mt-2">Volte em breve!</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>&copy; 2026 Feater. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
