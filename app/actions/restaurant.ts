"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateBookingStatus(formData: FormData) {
  const bookingId = formData.get("bookingId") as string;
  const status = formData.get("status") as "confirmed" | "cancelled";

  if (!bookingId || !status) {
    redirect("/restaurant/inbox?error=invalid_request");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: booking, error: loadError } = await supabase
    .from("bookings")
    .select("id, deal:deals!inner(restaurant:restaurants!inner(user_id))")
    .eq("id", bookingId)
    .single();

  if (loadError || !booking) {
    redirect("/restaurant/inbox?error=not_found");
  }

  const ownerId = (booking as any).deal?.restaurant?.user_id;
  if (ownerId !== user.id) {
    redirect("/restaurant/inbox?error=forbidden");
  }

  const { error: updateError } = await supabase.from("bookings").update({ status }).eq("id", bookingId);

  if (updateError) {
    redirect("/restaurant/inbox?error=update_failed");
  }

  redirect("/restaurant/inbox?updated=1");
}
