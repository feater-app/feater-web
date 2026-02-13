"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export interface LoginState {
  message: string | null;
  error: string | null;
  retryInSeconds: number;
}

function sanitizeOrigin(value: string | null | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

function mapOtpError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("redirect_to") && normalized.includes("not allowed")) {
    return "Callback não permitido no Supabase Auth (Redirect URLs).";
  }
  if (normalized.includes("email logins are disabled") || normalized.includes("provider is disabled")) {
    return "Login por e-mail está desativado no Supabase.";
  }
  if (normalized.includes("signups not allowed")) {
    return "Novos acessos estão bloqueados no Supabase.";
  }
  if (normalized.includes("rate limit") || normalized.includes("security purposes")) {
    return "Muitas tentativas em pouco tempo. Aguarde cerca de 60 segundos e tente novamente.";
  }
  return "Não foi possível enviar o link. Verifique seu e-mail e tente novamente.";
}

function normalizeNextPath(value: string | null | undefined) {
  if (!value) return "/dashboard";
  return value.startsWith("/") ? value : "/dashboard";
}

async function resolveAppOrigin(clientOrigin?: string | null) {
  const safeClientOrigin = sanitizeOrigin(clientOrigin);
  if (safeClientOrigin) return safeClientOrigin;

  const appUrl = sanitizeOrigin(process.env.NEXT_PUBLIC_APP_URL);
  if (appUrl) return appUrl;

  const h = await headers();
  const forwardedHost = h.get("x-forwarded-host");
  const host = forwardedHost || h.get("host");
  const proto = h.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");

  if (host) {
    const fromHeaders = sanitizeOrigin(`${proto}://${host}`);
    if (fromHeaders) return fromHeaders;
  }

  return "https://feater-web.vercel.app";
}

export async function sendMagicLinkAction(_: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim();
  const next = normalizeNextPath(formData.get("next") as string | null);
  const clientOrigin = formData.get("origin") as string | null;

  if (!email) {
    return { message: null, error: "Informe um e-mail válido.", retryInSeconds: 0 };
  }

  const supabase = await createClient();
  const origin = await resolveAppOrigin(clientOrigin);
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) {
    const cooldown = error.message.toLowerCase().includes("rate limit") ? 60 : 0;
    return {
      message: null,
      error: `${mapOtpError(error.message)} (detalhe: ${error.message})`,
      retryInSeconds: cooldown,
    };
  }

  return {
    message: "Link enviado! Confira sua caixa de entrada para entrar.",
    error: null,
    retryInSeconds: 0,
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
