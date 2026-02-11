import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/actions/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default async function AuthNav() {
  if (!hasSupabaseEnv) {
    return <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">Demo</span>;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link href="/login" className="rounded-full border border-primary/20 bg-white px-3 py-1 text-xs font-semibold text-primary">
        Entrar
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/dashboard" className="rounded-full border border-primary/20 bg-white px-3 py-1 text-xs font-semibold text-primary">
        Minhas
      </Link>
      <Link href="/restaurant/inbox" className="rounded-full border border-primary/20 bg-white px-3 py-1 text-xs font-semibold text-primary">
        Inbox
      </Link>
      <form action={signOutAction}>
        <button type="submit" className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500">
          Sair
        </button>
      </form>
    </div>
  );
}
