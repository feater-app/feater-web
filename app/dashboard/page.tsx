import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BrandLogo from "@/components/BrandLogo";
import AuthNav from "@/components/AuthNav";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusMap: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Aprovada",
  cancelled: "Recusada",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  await supabase.from("bookings").update({ user_id: user.id }).eq("user_email", user.email ?? "").is("user_id", null);

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, status, booking_date, created_at, deal:deals(id, title, restaurant:restaurants(name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const total = bookings?.length ?? 0;
  const approved = bookings?.filter((b) => b.status === "confirmed").length ?? 0;

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="nav-inner">
          <BrandLogo priority />
          <AuthNav />
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-5 md:py-7">
        <section className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Dashboard creator</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Minhas candidaturas</h1>
          <p className="mt-2 text-sm text-slate-500">Acompanhe status e resposta dos restaurantes em um so lugar.</p>

          <div className="mt-4 grid grid-cols-2 gap-3 md:max-w-sm">
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Total</p>
              <p className="mt-1 text-2xl font-semibold text-primary">{total}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Aprovadas</p>
              <p className="mt-1 text-2xl font-semibold text-primary">{approved}</p>
            </div>
          </div>
        </section>

        {bookings && bookings.length > 0 ? (
          <section className="space-y-3">
            {bookings.map((booking: any) => (
              <article key={booking.id} className="card space-y-3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{booking.deal?.title ?? "Permuta"}</p>
                    <p className="text-sm text-slate-500">{booking.deal?.restaurant?.name ?? "Restaurante"}</p>
                  </div>
                  <span className="badge-status">{statusMap[booking.status] ?? booking.status}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Data: {format(new Date(`${booking.booking_date}T12:00:00`), "dd MMM", { locale: ptBR })}</span>
                  <Link href={`/deal/${booking.deal?.id}`} className="font-semibold text-primary">
                    Ver permuta
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="card p-8 text-center">
            <p className="text-base font-semibold text-slate-700">Voce ainda nao tem candidaturas</p>
            <p className="mt-2 text-sm text-slate-500">Explore novas permutas e envie sua primeira candidatura.</p>
            <div className="mt-4">
              <Link href="/" className="btn-primary">
                Explorar permutas
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
