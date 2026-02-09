import { createClient } from "@/lib/supabase/server";
import { getMockDeal } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import BookingForm from "@/components/BookingForm";

const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL;

interface BookingPageProps {
  params: Promise<{ dealId: string }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { dealId } = await params;

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
          <h1 className="text-xl font-bold">Complete Your Booking</h1>
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
        <BookingForm deal={deal} isMockMode={isMockMode} />
      </main>
    </div>
  );
}
