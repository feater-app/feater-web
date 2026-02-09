"use server";

import { createClient } from "@/lib/supabase/server";
import { mockBookings } from "@/lib/mock-data";
import { redirect } from "next/navigation";

const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL;

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

  // Real Supabase mode
  const supabase = await createClient();

  // Check available spots
  const { data: deal } = await supabase
    .from("deals")
    .select("available_spots")
    .eq("id", dealId)
    .single();

  if (!deal || deal.available_spots < 1) {
    redirect(`/book/${dealId}?error=no_spots`);
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      deal_id: dealId,
      user_name: name,
      user_email: email,
      user_phone: phone,
      num_people: numPeople,
      booking_date: bookingDate,
      notes,
      status: "pending",
    })
    .select()
    .single();

  if (error || !booking) {
    redirect(`/book/${dealId}?error=failed`);
  }

  // Decrement available spots
  await supabase
    .from("deals")
    .update({ available_spots: deal.available_spots - 1 })
    .eq("id", dealId);

  redirect(`/booking-success?id=${booking.id}`);
}
