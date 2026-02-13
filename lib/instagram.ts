import crypto from "node:crypto";

interface InstagramStatePayload {
  userId: string;
  next: string;
  timestamp: number;
}

function getStateSecret() {
  return (
    process.env.INSTAGRAM_STATE_SECRET ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "feater-instagram-state-dev-only"
  );
}

function base64urlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64urlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return crypto.createHmac("sha256", getStateSecret()).update(value).digest("base64url");
}

export function normalizeNextPath(value: string | null | undefined) {
  if (!value) return "/dashboard";
  return value.startsWith("/") ? value : "/dashboard";
}

export function createInstagramState(payload: Omit<InstagramStatePayload, "timestamp">) {
  const fullPayload: InstagramStatePayload = {
    ...payload,
    timestamp: Date.now(),
  };

  const raw = JSON.stringify(fullPayload);
  const encoded = base64urlEncode(raw);
  return `${encoded}.${sign(encoded)}`;
}

export function verifyInstagramState(state: string, maxAgeMs = 10 * 60 * 1000) {
  const [encoded, signature] = state.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  try {
    const payload = JSON.parse(base64urlDecode(encoded)) as InstagramStatePayload;
    if (!payload?.userId || !payload?.timestamp) return null;
    if (Date.now() - payload.timestamp > maxAgeMs) return null;
    return payload;
  } catch {
    return null;
  }
}

export function resolveAppOriginFromRequest(requestUrl: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (appUrl) return appUrl;

  const { origin } = new URL(requestUrl);
  return origin;
}

export function getInstagramRedirectUri(origin: string) {
  return process.env.INSTAGRAM_REDIRECT_URI || `${origin}/api/instagram/callback`;
}

export function getInstagramConfig() {
  return {
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
  };
}
