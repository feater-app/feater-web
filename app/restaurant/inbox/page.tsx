import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BrandLogo from "@/components/BrandLogo";
import AuthNav from "@/components/AuthNav";
import { updateBookingStatus } from "@/app/actions/restaurant";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusMap: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Aprovada",
  cancelled: "Recusada",
};

interface InboxPageProps {
  searchParams: Promise<{ updated?: string; error?: string }>;
}

export default async function RestaurantInboxPage({ searchParams }: InboxPageProps) {
  const { updated, error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/restaurant/inbox");
  }

  const { data: restaurants } = await supabase.from("restaurants").select("id, name").eq("user_id", user.id);
  const restaurantIds = (restaurants ?? []).map((restaurant) => restaurant.id);

  let bookings: any[] = [];
  if (restaurantIds.length > 0) {
    const { data } = await supabase
      .from("bookings")
      .select("id, status, booking_date, created_at, user_name, user_email, notes, deal:deals!inner(id, title, restaurant_id)")
      .in("deal.restaurant_id", restaurantIds)
      .order("created_at", { ascending: false });
    bookings = data ?? [];
  }

  const creatorIds = Array.from(new Set(bookings.map((booking) => booking.user_id).filter(Boolean)));
  let socialByUser = new Map<string, any>();

  if (creatorIds.length > 0) {
    const { data: socials } = await supabase
      .from("creator_social_accounts")
      .select("user_id, provider, username, connected")
      .eq("provider", "instagram")
      .in("user_id", creatorIds);

    socialByUser = new Map((socials ?? []).map((item) => [item.user_id, item]));
  }

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="nav-inner">
          <BrandLogo priority />
          <AuthNav />
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 md:py-7">
        <section className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Painel restaurante</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Inbox de candidaturas</h1>
          <p className="mt-2 text-sm text-slate-500">Avalie pedidos recebidos e atualize status com rapidez.</p>

          {updated && <p className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Status atualizado com sucesso.</p>}
          {error && <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">Nao foi possivel atualizar o status. Tente novamente.</p>}
        </section>

        {bookings.length > 0 ? (
          <section className="space-y-3">
            {bookings.map((booking) => (
              <article key={booking.id} className="card space-y-4 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{booking.deal?.title}</p>
                    <p className="text-sm text-slate-500">
                      {booking.user_name} • {booking.user_email}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Data solicitada: {format(new Date(`${booking.booking_date}T12:00:00`), "dd MMM", { locale: ptBR })}
                    </p>
                  </div>

                  <span className="badge-status">{statusMap[booking.status] ?? booking.status}</span>
                </div>

                {booking.notes && <p className="text-sm text-slate-600">{booking.notes}</p>}

                {booking.user_id && (
                  <p className="text-xs text-slate-500">
                    Instagram: {socialByUser.get(booking.user_id)?.connected ? `conectado${socialByUser.get(booking.user_id)?.username ? ` (@${socialByUser.get(booking.user_id).username.replace("@", "")})` : ""}` : "nao conectado"}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/deal/${booking.deal?.id}`} className="btn-secondary">
                    Ver permuta
                  </Link>

                  {booking.status === "pending" && (
                    <>
                      <form action={updateBookingStatus}>
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <input type="hidden" name="status" value="confirmed" />
                        <button type="submit" className="btn-primary">
                          Aprovar
                        </button>
                      </form>

                      <form action={updateBookingStatus}>
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <input type="hidden" name="status" value="cancelled" />
                        <button type="submit" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
                          Recusar
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="card p-8 text-center">
            <p className="text-base font-semibold text-slate-700">Nenhuma candidatura encontrada</p>
            <p className="mt-2 text-sm text-slate-500">Quando creators enviarem candidaturas, elas aparecerao aqui.</p>
          </section>
        )}
      </main>
    </div>
  );
}
