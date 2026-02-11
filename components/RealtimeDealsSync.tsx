"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface RealtimeDealsSyncProps {
  dealId?: string;
}

export default function RealtimeDealsSync({ dealId }: RealtimeDealsSyncProps) {
  const router = useRouter();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return;
    }

    const supabase = createClient();
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const channel = supabase
      .channel(dealId ? `deals-${dealId}` : "deals-feed")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "deals",
          ...(dealId ? { filter: `id=eq.${dealId}` } : {}),
        },
        () => {
          if (timeout) clearTimeout(timeout);
          timeout = setTimeout(() => router.refresh(), 250);
        }
      )
      .subscribe();

    return () => {
      if (timeout) clearTimeout(timeout);
      void supabase.removeChannel(channel);
    };
  }, [dealId, router]);

  return null;
}
