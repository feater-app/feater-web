"use server";

import { createClient } from "@/lib/supabase/server";
import { getInstagramIdentity } from "@/lib/creator";
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

export async function syncInstagramConnectionAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding");
  }

  const next = (formData.get("next") as string) || "/dashboard";
  const identity = getInstagramIdentity(user);

  if (!identity) {
    redirect(`/onboarding?next=${encodeURIComponent(next)}&error=instagram_not_connected`);
  }

  const username =
    identity.identity_data?.preferred_username ||
    identity.identity_data?.user_name ||
    identity.identity_data?.username ||
    null;

  await supabase.from("creator_social_accounts").upsert(
    {
      user_id: user.id,
      provider: "instagram",
      provider_user_id: identity.id,
      username,
      connected: true,
      last_sync_at: new Date().toISOString(),
    },
    { onConflict: "user_id,provider" }
  );

  await supabase.from("creator_profiles").upsert(
    {
      user_id: user.id,
      onboarding_step: 3,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  redirect(`/onboarding?next=${encodeURIComponent(next)}&connected=1`);
}
