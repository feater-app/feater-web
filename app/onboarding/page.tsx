import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BrandLogo from "@/components/BrandLogo";
import AuthNav from "@/components/AuthNav";
import InstagramConnectButton from "@/components/InstagramConnectButton";
import { saveCreatorProfileAction } from "@/app/actions/onboarding";
import { getInstagramIdentity } from "@/lib/creator";
import { hasSupabaseEnv } from "@/lib/supabase/env";

interface OnboardingPageProps {
  searchParams: Promise<{ next?: string; saved?: string; connected?: string; error?: string }>;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const { next = "/dashboard", saved, connected, error } = await searchParams;

  if (!hasSupabaseEnv) {
    redirect("/");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/onboarding?next=${next}`)}`);
  }

  const identity = getInstagramIdentity(user);

  if (identity) {
    const username =
      identity.identity_data?.preferred_username ||
      identity.identity_data?.user_name ||
      identity.identity_data?.username ||
      null;

    await supabase.from("creator_social_accounts").upsert(
      {
        user_id: user.id,
        provider: "instagram",
        provider_user_id: identity.id,
        username,
        connected: true,
        last_sync_at: new Date().toISOString(),
      },
      { onConflict: "user_id,provider" }
    );
  }

  const [{ data: profile }, { data: social }] = await Promise.all([
    supabase.from("creator_profiles").select("full_name, phone, niche, city, audience_range, bio").eq("user_id", user.id).maybeSingle(),
    supabase.from("creator_social_accounts").select("id, username, connected").eq("user_id", user.id).eq("provider", "instagram").maybeSingle(),
  ]);

  const isConnected = Boolean(social?.connected);

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="nav-inner">
          <BrandLogo priority />
          <AuthNav />
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-5 md:py-7">
        <section className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Onboarding creator</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Configure seu perfil</h1>
          <p className="mt-2 text-sm text-slate-500">Para se candidatar, precisamos de perfil basico e Instagram conectado.</p>

          {saved && <p className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Perfil salvo com sucesso.</p>}
          {connected && <p className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Instagram conectado com sucesso.</p>}
          {error && <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">Nao foi possivel conectar Instagram. Tente novamente.</p>}
        </section>

        <section className="card space-y-4 p-5">
          <p className="text-sm font-semibold text-slate-900">1. Perfil basico</p>

          <form action={saveCreatorProfileAction} className="space-y-3">
            <input type="hidden" name="next" value={next} />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input name="fullName" defaultValue={profile?.full_name ?? ""} className="input" placeholder="Nome completo" required />
              <input name="phone" defaultValue={profile?.phone ?? ""} className="input" placeholder="Telefone" />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input name="niche" defaultValue={profile?.niche ?? ""} className="input" placeholder="Nicho (food, lifestyle, etc)" required />
              <input name="city" defaultValue={profile?.city ?? ""} className="input" placeholder="Cidade" required />
            </div>

            <select name="audienceRange" defaultValue={profile?.audience_range ?? ""} className="input" required>
              <option value="" disabled>
                Faixa de audiencia
              </option>
              <option value="5k-10k">5k-10k</option>
              <option value="10k-25k">10k-25k</option>
              <option value="25k-50k">25k-50k</option>
              <option value="50k+">50k+</option>
            </select>

            <textarea
              name="bio"
              defaultValue={profile?.bio ?? ""}
              className="input min-h-[110px]"
              placeholder="Resumo rapido sobre voce e tipo de conteudo"
              required
            />

            <button type="submit" className="btn-secondary w-full">
              Salvar perfil
            </button>
          </form>
        </section>

        <section className="card space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900">2. Conectar Instagram</p>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isConnected ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              {isConnected ? "Conectado" : "Pendente"}
            </span>
          </div>

          {isConnected ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Instagram conectado{social?.username ? `: @${social.username.replace("@", "")}` : ""}.
            </p>
          ) : (
            <InstagramConnectButton nextPath={next} disabled={!profile?.full_name || !profile?.niche || !profile?.city || !profile?.audience_range} />
          )}

          {!profile?.full_name && <p className="text-xs text-slate-500">Salve o perfil primeiro para habilitar conexao social.</p>}
        </section>

        <section className="card p-5">
          <p className="text-sm text-slate-600">Quando concluir os 2 passos, voce podera enviar candidaturas normalmente.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={isConnected ? next : "/dashboard"} className={`btn-primary ${isConnected ? "" : "pointer-events-none opacity-50"}`}>
              Continuar
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              Ir para dashboard
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
