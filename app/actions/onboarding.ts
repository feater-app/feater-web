"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function saveCreatorProfileAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding");
  }

  const next = (formData.get("next") as string) || "/dashboard";
  const fullName = (formData.get("fullName") as string) || null;
  const phone = (formData.get("phone") as string) || null;
  const niche = (formData.get("niche") as string) || null;
  const city = (formData.get("city") as string) || null;
  const audienceRange = (formData.get("audienceRange") as string) || null;
  const bio = (formData.get("bio") as string) || null;

  await supabase.from("creator_profiles").upsert(
    {
      user_id: user.id,
      full_name: fullName,
      phone,
      niche,
      city,
      audience_range: audienceRange,
      bio,
      onboarding_step: 2,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  redirect(`/onboarding?next=${encodeURIComponent(next)}&saved=1`);
}
