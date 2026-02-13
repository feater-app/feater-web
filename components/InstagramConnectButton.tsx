"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "";

interface InstagramConnectButtonProps {
  nextPath: string;
  disabled?: boolean;
}

export default function InstagramConnectButton({ nextPath, disabled = false }: InstagramConnectButtonProps) {
  const [loading, setLoading] = useState(false);

  const connectInstagram = async () => {
    if (disabled) return;
    setLoading(true);

    try {
      const supabase = createClient();
      const origin = appUrl || window.location.origin;
      const callback = `${origin}/auth/callback?next=${encodeURIComponent(`/onboarding?next=${nextPath}`)}`;

      await supabase.auth.signInWithOAuth({
        provider: "instagram" as any,
        options: { redirectTo: callback },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type="button" onClick={connectInstagram} className="btn-primary w-full" disabled={loading || disabled}>
      {loading ? "Conectando..." : "Conectar Instagram"}
    </button>
  );
}
