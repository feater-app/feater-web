import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createInstagramState,
  getInstagramConfig,
  getInstagramRedirectUri,
  normalizeNextPath,
  resolveAppOriginFromRequest,
} from "@/lib/instagram";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { searchParams } = new URL(request.url);
  const next = normalizeNextPath(searchParams.get("next"));

  if (!user) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}`, request.url));
  }

  const origin = resolveAppOriginFromRequest(request.url);
  const { clientId } = getInstagramConfig();

  if (!clientId) {
    return NextResponse.redirect(new URL(`/onboarding?next=${encodeURIComponent(next)}&error=instagram_config_missing`, request.url));
  }

  const redirectUri = getInstagramRedirectUri(origin);
  const state = createInstagramState({ userId: user.id, next });

  const authorizeUrl = new URL("https://api.instagram.com/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", "user_profile");
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("state", state);

  return NextResponse.redirect(authorizeUrl);
}
