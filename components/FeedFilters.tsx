"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Platform = "" | "instagram" | "tiktok";
type SortBy = "newest" | "followers" | "spots" | "ending_soon";

interface FeedFiltersProps {
  initialQuery: string;
  initialPlatform: Platform;
  initialFollowers: number | null;
  initialDay: string;
  initialSort: SortBy;
}

interface FilterUpdates {
  q?: string | null;
  platform?: Platform;
  followers?: number | null;
  day?: string;
  sort?: SortBy;
}

const RECENT_SEARCHES_KEY = "feater_recent_searches";

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

const sortOptions: Array<{ label: string; value: SortBy }> = [
  { label: "Mais recentes", value: "newest" },
  { label: "Maior minimo", value: "followers" },
  { label: "Mais vagas", value: "spots" },
  { label: "Expira antes", value: "ending_soon" },
];

export default function FeedFilters({
  initialQuery,
  initialPlatform,
  initialFollowers,
  initialDay,
  initialSort,
}: FeedFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(RECENT_SEARCHES_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        setRecentSearches(parsed.filter((item) => typeof item === "string").slice(0, 5));
      }
    } catch {
      setRecentSearches([]);
    }
  }, []);

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

    if (updates.sort !== undefined) {
      if (updates.sort === "newest") params.delete("sort");
      else params.set("sort", updates.sort);
    }

    const next = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    startTransition(() => {
      router.replace(next, { scroll: false });
    });
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const cleaned = query.trim();

    if (cleaned) {
      const nextRecents = [cleaned, ...recentSearches.filter((item) => item.toLowerCase() !== cleaned.toLowerCase())].slice(0, 5);
      setRecentSearches(nextRecents);
      window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(nextRecents));
    }

    applyFilters({ q: cleaned || null });
  };

  return (
    <section className="card space-y-4 p-4 md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Filtrar permutas</p>
          <p className="text-xs text-slate-500">Atualizacao em tempo real sem recarregar a pagina</p>
        </div>

        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Ordenacao
          <select
            value={initialSort}
            onChange={(event) => applyFilters({ sort: event.target.value as SortBy })}
            className="input mt-2 py-2"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <form onSubmit={submitSearch} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          className="input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Restaurante, nicho, recompensa"
        />
        <button type="submit" className="btn-primary sm:w-auto" disabled={isPending}>
          {isPending ? "Atualizando..." : "Buscar"}
        </button>
      </form>

      {recentSearches.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Buscas recentes</p>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((item) => (
              <button
                key={item}
                type="button"
                className="chip"
                onClick={() => {
                  setQuery(item);
                  applyFilters({ q: item });
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Plataforma</p>
          <div className="flex flex-wrap gap-2">
            {platformOptions.map((option) => {
              const selected = initialPlatform === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`chip ${selected ? "!border-primary !bg-primary !text-white" : ""}`}
                  onClick={() => applyFilters({ platform: selected ? "" : option.value })}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Seguidores</p>
          <div className="flex flex-wrap gap-2">
            {followersOptions.map((followers) => {
              const selected = initialFollowers === followers;
              return (
                <button
                  key={followers}
                  type="button"
                  className={`chip ${selected ? "!border-primary !bg-primary !text-white" : ""}`}
                  onClick={() => applyFilters({ followers: selected ? null : followers })}
                >
                  {followers / 1000}k+
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Dia</p>
          <div className="flex flex-wrap gap-2">
            {dayOptions.map((option) => {
              const selected = initialDay === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`chip ${selected ? "!border-primary !bg-primary !text-white" : ""}`}
                  onClick={() => applyFilters({ day: selected ? "" : option.value })}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {activeCount > 0 && (
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-primary/10 bg-primary/[0.05] px-3 py-2 text-xs">
          <span className="font-semibold text-primary">{activeCount} filtro(s) ativo(s)</span>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              applyFilters({ q: null, platform: "", followers: null, day: "", sort: "newest" });
            }}
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </section>
  );
}
