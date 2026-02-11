import type { User } from "@supabase/supabase-js";

export function getInstagramIdentity(user: User | null) {
  const identities = (user as any)?.identities as Array<any> | undefined;
  if (!identities || identities.length === 0) return null;

  return identities.find((identity) => identity.provider === "instagram") ?? null;
}

export function isInstagramConnected(user: User | null) {
  return Boolean(getInstagramIdentity(user));
}
