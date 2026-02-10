"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const platformOptions = [
  { label: "Instagram", value: "instagram" },
  { label: "TikTok", value: "tiktok" },
] as const;

const followersOptions = [5000, 10000, 15000] as const;

const dayOptions = [
  { label: "Seg", value: "monday" },
  { label: "Sex", value: "friday" },
  { label: "Sab", value: "saturday" },
  { label: "Dom", value: "sunday" },
] as const;

interface FeedFiltersProps {
  initialQuery: string;
  initialPlatform: "instagram" | "tiktok" | "";
  initialFollowers: number | null;
  initialDay: string;
}

interface FilterUpdates {
  q?: string | null;
  platform?: "instagram" | "tiktok" | "";
  followers?: number | null;
  day?: string;
}

export default function FeedFilters({ initialQuery, initialPlatform, initialFollowers, initialDay }: FeedFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);
  const [expanded, setExpanded] = useState(Boolean(initialPlatform || initialFollowers || initialDay));

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (initialPlatform || initialFollowers || initialDay) {
      setExpanded(true);
    }
  }, [initialDay, initialFollowers, initialPlatform]);

  const activeCount = useMemo(() => {
    let count = 0;
    if (initialQuery) count += 1;
    if (initialPlatform) count += 1;
    if (initialFollowers) count += 1;
    if (initialDay) count += 1;
    return count;
  }, [initialDay, initialFollowers, initialPlatform, initialQuery]);

  const applyFilters = (updates: FilterUpdates) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.q !== undefined) {
      if (updates.q) params.set("q", updates.q);
      else params.delete("q");
    }

    if (updates.platform !== undefined) {
      if (updates.platform) params.set("platform", updates.platform);
      else params.delete("platform");
    }

    if (updates.followers !== undefined) {
      if (updates.followers) params.set("followers", String(updates.followers));
      else params.delete("followers");
    }

    if (updates.day !== undefined) {
      if (updates.day) params.set("day", updates.day);
      else params.delete("day");
    }

    const next = params.toString() ? `${pathname}?${params.toString()}` : pathname;

    startTransition(() => {
      router.replace(next, { scroll: false });
    });
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    applyFilters({ q: query.trim() || null });
  };

  return (
    <section className="filter-shell space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Buscar permutas</p>
          <p className="text-xs text-slate-500">Filtro instantaneo sem recarregar a pagina</p>
        </div>

        <button type="button" className="filter-toggle" onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? "Ocultar filtros" : "Mostrar filtros"}
        </button>
      </div>

      <form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="input"
          placeholder="Restaurante, nicho ou recompensa"
        />
        <button type="submit" className="btn-primary sm:w-auto" disabled={isPending}>
          {isPending ? "Atualizando..." : "Buscar"}
        </button>
      </form>

      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="filter-chip filter-chip-active">{activeCount} filtros ativos</span>
          {initialPlatform && <span className="filter-chip">{initialPlatform === "instagram" ? "Instagram" : "TikTok"}</span>}
          {initialFollowers && <span className="filter-chip">{initialFollowers / 1000}k+ seguidores</span>}
          {initialDay && <span className="filter-chip">{dayOptions.find((day) => day.value === initialDay)?.label || initialDay}</span>}
          <button
            type="button"
            onClick={() => {
              setQuery("");
              applyFilters({ q: null, platform: "", followers: null, day: "" });
            }}
            className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
          >
            Limpar tudo
          </button>
        </div>
      )}

      {expanded && (
        <div className="space-y-4 border-t border-slate-100 pt-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Plataforma</p>
            <div className="grid grid-cols-2 gap-2">
              {platformOptions.map((option) => {
                const selected = initialPlatform === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`chip w-full justify-center ${selected ? "!border-primary !bg-primary !text-white" : ""}`}
                    onClick={() => applyFilters({ platform: selected ? "" : option.value })}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Minimo de seguidores</p>
            <div className="grid grid-cols-3 gap-2">
              {followersOptions.map((followers) => {
                const selected = initialFollowers === followers;
                return (
                  <button
                    key={followers}
                    type="button"
                    className={`chip w-full justify-center ${selected ? "!border-primary !bg-primary !text-white" : ""}`}
                    onClick={() => applyFilters({ followers: selected ? null : followers })}
                  >
                    {followers / 1000}k+
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Dia de disponibilidade</p>
            <div className="grid grid-cols-4 gap-2">
              {dayOptions.map((option) => {
                const selected = initialDay === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`chip w-full justify-center px-2 ${selected ? "!border-primary !bg-primary !text-white" : ""}`}
                    onClick={() => applyFilters({ day: selected ? "" : option.value })}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
