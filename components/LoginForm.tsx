"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { sendMagicLinkAction, type LoginState } from "@/app/actions/auth";

const hasSupabaseEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

interface LoginFormProps {
  next: string;
}

export default function LoginForm({ next }: LoginFormProps) {
  const initialState: LoginState = { message: null, error: null, retryInSeconds: 0 };
  const [state, formAction, pending] = useActionState(sendMagicLinkAction, initialState);
  const [email, setEmail] = useState("");
  const [retryInSeconds, setRetryInSeconds] = useState(0);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (state.retryInSeconds > 0) {
      setRetryInSeconds(state.retryInSeconds);
    }
  }, [state.retryInSeconds]);

  useEffect(() => {
    if (retryInSeconds <= 0) return;

    const timer = setInterval(() => {
      setRetryInSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [retryInSeconds]);
  return (
    <div className="card space-y-5 p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Feater</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Entrar como creator</h1>
        <p className="mt-2 text-sm text-slate-500">Use seu e-mail para receber um link magico e acessar seu dashboard.</p>
      </div>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="next" value={next} />
        <input type="hidden" name="origin" value={origin} />
        <input
          type="email"
          name="email"
          className="input"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@email.com"
          required
        />
        <button type="submit" className="btn-primary w-full" disabled={pending || !hasSupabaseEnv || retryInSeconds > 0}>
          {pending ? "Enviando..." : retryInSeconds > 0 ? `Tente em ${retryInSeconds}s` : "Enviar link de acesso"}
        </button>
      </form>

      {!hasSupabaseEnv && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Login indisponivel em demo mode. Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.
        </p>
      )}

      {state.message && <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.message}</p>}
      {state.error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>}

      <Link href="/" className="inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline">
        Voltar para permutas
      </Link>
    </div>
  );
}
