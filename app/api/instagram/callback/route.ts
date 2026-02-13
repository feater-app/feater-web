import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getInstagramConfig,
  getInstagramRedirectUri,
  normalizeNextPath,
  resolveAppOriginFromRequest,
  verifyInstagramState,
} from "@/lib/instagram";

interface InstagramTokenResponse {
  access_token: string;
  user_id: number;
}

interface InstagramMeResponse {
  id: string;
  username?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error") || searchParams.get("error_reason");

  if (!code || !state || oauthError) {
    return NextResponse.redirect(new URL("/onboarding?error=instagram_connect_failed", request.url));
  }

  const payload = verifyInstagramState(state);
  if (!payload) {
    return NextResponse.redirect(new URL("/onboarding?error=instagram_state_invalid", request.url));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(`/onboarding?next=${payload.next}`)}`, request.url));
  }

  if (user.id !== payload.userId) {
    return NextResponse.redirect(new URL("/onboarding?error=instagram_user_mismatch", request.url));
  }

  const origin = resolveAppOriginFromRequest(request.url);
  const { clientId, clientSecret } = getInstagramConfig();

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL(`/onboarding?next=${encodeURIComponent(payload.next)}&error=instagram_config_missing`, request.url));
  }

  const redirectUri = getInstagramRedirectUri(origin);

  const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    }).toString(),
  });

  if (!tokenResponse.ok) {
    return NextResponse.redirect(new URL(`/onboarding?next=${encodeURIComponent(payload.next)}&error=instagram_token_failed`, request.url));
  }

  const tokenJson = (await tokenResponse.json()) as InstagramTokenResponse;

  const meResponse = await fetch(
    `https://graph.instagram.com/me?fields=id,username&access_token=${encodeURIComponent(tokenJson.access_token)}`
  );

  if (!meResponse.ok) {
    return NextResponse.redirect(new URL(`/onboarding?next=${encodeURIComponent(payload.next)}&error=instagram_profile_failed`, request.url));
  }

  const meJson = (await meResponse.json()) as InstagramMeResponse;

  await supabase.from("creator_social_accounts").upsert(
    {
      user_id: user.id,
      provider: "instagram",
      provider_user_id: meJson.id || String(tokenJson.user_id),
      username: meJson.username ?? null,
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

  const safeNext = normalizeNextPath(payload.next);
  return NextResponse.redirect(`${origin}/onboarding?next=${encodeURIComponent(safeNext)}&connected=1`);
}
