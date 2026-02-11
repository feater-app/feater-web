"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const hasSupabaseEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (!hasSupabaseEnv) {
        setError("Supabase nao configurado no ambiente atual.");
        return;
      }

      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });

      if (error) {
        setError("Nao foi possivel enviar o link. Verifique seu e-mail e tente novamente.");
      } else {
        setMessage("Link enviado! Confira sua caixa de entrada para entrar.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8">
      <div className="card space-y-5 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Feater</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Entrar como creator</h1>
          <p className="mt-2 text-sm text-slate-500">Use seu e-mail para receber um link magico e acessar seu dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            className="input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@email.com"
            required
          />
          <button type="submit" className="btn-primary w-full" disabled={loading || !hasSupabaseEnv}>
            {loading ? "Enviando..." : "Enviar link de acesso"}
          </button>
        </form>

        {!hasSupabaseEnv && (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Login indisponivel em demo mode. Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.
          </p>
        )}

        {message && <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
        {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <Link href="/" className="inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline">
          Voltar para permutas
        </Link>
      </div>
    </main>
  );
}
