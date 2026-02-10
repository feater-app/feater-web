import { createClient } from "@/lib/supabase/server";
import { getMockDeal } from "@/lib/mock-data";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Image from "next/image";
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

  let booking: any = null;
  const statusMap: Record<string, string> = {
    pending: "pendente",
    confirmed: "confirmada",
    cancelled: "cancelada",
  };

  if (mock === "true" && dealId) {
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
      .select("*, deal:deals (title, restaurant:restaurants (name, address))")
      .eq("id", id)
      .single();
    booking = data;
  }

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="nav-inner justify-center">
          <Image src="/logo-feater.png" alt="Feater" width={124} height={34} className="brand-logo" priority />
        </div>
      </header>

      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-6 md:max-w-lg md:py-8">
        <section className="hero-surface text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold">Candidatura enviada!</h1>
          <p className="mt-2 text-sm text-white/90">Seu interesse na permuta foi enviado para avaliacao do restaurante.</p>
        </section>

        {booking && (
          <section className="card space-y-3 p-5">
            <p className="text-base font-semibold text-slate-900">Detalhes da candidatura</p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Permuta</span>
                <span className="text-right font-semibold text-slate-800">{booking.deal.title}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Restaurante</span>
                <span className="text-right font-semibold text-slate-800">{booking.deal.restaurant.name}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Nome</span>
                <span className="text-right font-semibold text-slate-800">{booking.user_name}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Data</span>
                <span className="text-right font-semibold text-slate-800">
                  {format(new Date(booking.booking_date + "T12:00:00"), "dd 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Pessoas</span>
                <span className="text-right font-semibold text-slate-800">{booking.num_people}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Status</span>
                <span className="badge-status">{statusMap[booking.status] ?? booking.status}</span>
              </div>
            </div>

            {booking.deal.restaurant.address && <p className="glass-note">{booking.deal.restaurant.address}</p>}
          </section>
        )}

        <section className="card space-y-2 p-5 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Proximos passos</p>
          <p>• Voce recebe um e-mail de confirmacao</p>
          <p>• O restaurante revisa seu perfil e briefing</p>
          <p>• Se aprovado, voces alinham data e entregas</p>
        </section>

        <div className="space-y-2">
          <Link href="/" className="btn-primary w-full">
            Ver mais permutas
          </Link>
          {booking?.deal_id && (
            <Link href={`/deal/${booking.deal_id}`} className="btn-secondary w-full">
              Ver detalhes da permuta
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
