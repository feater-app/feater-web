import { createClient } from "@/lib/supabase/server";
import { getMockDeal } from "@/lib/mock-data";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

interface SuccessPageProps {
  searchParams: Promise<{
    id?: string;
    mock?: string;
    dealId?: string;
    name?: string;
    date?: string;
    people?: string;
  }>;
}

export default async function BookingSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const { id, mock, dealId, name, date, people } = params;

  // Build a display object from either real DB or mock query params
  let booking: any = null;
  const statusMap: Record<string, string> = {
    pending: "pendente",
    confirmed: "confirmada",
    cancelled: "cancelada",
  };

  if (mock === "true" && dealId) {
    // Mock mode: reconstruct from URL params
    const deal = getMockDeal(dealId);
    if (deal && name && date && people) {
      booking = {
        id,
        user_name: decodeURIComponent(name),
        num_people: parseInt(people),
        booking_date: date,
        status: "pending",
        deal_id: dealId,
        deal: {
          title: deal.title,
          restaurant: { name: deal.restaurant.name, address: deal.restaurant.address },
        },
      };
    }
  } else if (id && !mock) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("bookings")
      .select(
        `*, deal:deals (title, restaurant:restaurants (name, address))`
      )
      .eq("id", id)
      .single();
    booking = data;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reserva confirmada!</h1>
          <p className="text-gray-600">Sua solicitação de reserva foi enviada com sucesso</p>
        </div>

        {/* Booking Details */}
        {booking && (
          <div className="card p-6 mb-6">
            <h2 className="font-bold mb-4">Detalhes da reserva</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Oferta:</span>
                <span className="font-medium text-right">{booking.deal.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Restaurante:</span>
                <span className="font-medium">{booking.deal.restaurant.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nome:</span>
                <span className="font-medium">{booking.user_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Data:</span>
                <span className="font-medium">
                  {format(new Date(booking.booking_date + "T12:00:00"), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pessoas:</span>
                <span className="font-medium">{booking.num_people}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className="badge-status capitalize">{statusMap[booking.status] ?? booking.status}</span>
              </div>
            </div>

            {booking.deal.restaurant.address && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 mb-1">Localização</p>
                <p className="text-sm">{booking.deal.restaurant.address}</p>
              </div>
            )}
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">O que acontece agora?</p>
              <ul className="space-y-1 text-gray-600">
                <li>• Você receberá um e-mail de confirmação em breve</li>
                <li>• O restaurante irá analisar sua reserva</li>
                <li>• Você será contatado em até 24 horas</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/" className="btn-primary w-full block text-center">
            Ver mais ofertas
          </Link>
          {booking?.deal_id && (
            <Link href={`/deal/${booking.deal_id}`} className="btn-secondary w-full block text-center">
              Ver detalhes da oferta
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
