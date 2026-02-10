"use server";

import { createClient } from "@/lib/supabase/server";
import { mockBookings } from "@/lib/mock-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { redirect } from "next/navigation";

const isMockMode = !hasSupabaseEnv;

function mapBookingError(message: string | undefined) {
  const normalized = message?.toUpperCase() ?? "";

  if (normalized.includes("NO_SPOTS")) return "no_spots";
  if (normalized.includes("INVALID_PARTY_SIZE")) return "invalid_party_size";
  if (normalized.includes("DEAL_NOT_FOUND")) return "deal_not_found";

  return "failed";
}

export async function createBooking(formData: FormData) {
  const dealId = formData.get("dealId") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || null;
  const numPeople = parseInt(formData.get("numPeople") as string);
  const bookingDate = formData.get("bookingDate") as string;
  const notes = (formData.get("notes") as string) || null;

  if (isMockMode) {
    // Mock mode: store in-memory and redirect to success
    const mockId = `mock-${Date.now()}`;
    mockBookings.push({
      id: mockId,
      deal_id: dealId,
      user_name: name,
      user_email: email,
      user_phone: phone,
      num_people: numPeople,
      booking_date: bookingDate,
      notes,
      status: "pending",
      created_at: new Date().toISOString(),
    });
    redirect(`/booking-success?id=${mockId}&mock=true&dealId=${dealId}&name=${encodeURIComponent(name)}&date=${bookingDate}&people=${numPeople}`);
  }

  // Real Supabase mode (atomic DB function)
  const supabase = await createClient();

  const { data: bookingId, error } = await supabase.rpc("create_booking_with_spot", {
    p_deal_id: dealId,
    p_user_name: name,
    p_user_email: email,
    p_user_phone: phone,
    p_num_people: numPeople,
    p_booking_date: bookingDate,
    p_notes: notes,
  });

  if (error || !bookingId) {
    redirect(`/book/${dealId}?error=${mapBookingError(error?.message)}`);
  }

  redirect(`/booking-success?id=${bookingId}`);
}
