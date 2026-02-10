# Feater Web

Feater Web is a mobile-first marketplace for **permutas** between restaurants and creators.

The flow is simple: restaurants publish a collaboration brief (reward + deliverables), creators apply, and both sides align execution.

This repository is built to be practical in production and clear to read in public.

## Product Snapshot

- Creator-facing feed of active permutas
- Requirement-first cards (minimum followers + IG/TikTok deliverables)
- Detail page with reward, schedule, and restaurant profile
- Candidatura flow with server actions
- Confirmation page and next-step messaging
- Works in:
  - `Mock mode` (no Supabase required)
  - `Supabase mode` (real data + atomic spot handling)

## Stack

- `Next.js 15` (App Router, Server Components)
- `TypeScript` (strict)
- `Tailwind CSS`
- `Supabase` (Postgres, RLS, RPC)
- `Bun` (runtime/package manager)
- `next-pwa` (installable web app)

## Engineering Notes

- Centralized Supabase env validation in `lib/supabase/env.ts`
- Atomic write path via `create_booking_with_spot` RPC (insert + spot decrement)
- Single source schema under `supabase/schema.sql`
- PT-BR-first UI copy
- Brand/theme aligned with the RN app

## Quick Start

1. Install dependencies

```bash
bun install
```

2. Run in mock mode immediately

```bash
bun dev
```

Open `http://localhost:3000`.

## Supabase Setup (Real Data)

1. Create a Supabase project
2. Copy `.env.local.example` to `.env.local`
3. Fill:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Execute SQL:

- Run `supabase/schema.sql` once (it resets and recreates all Feater tables + seed data)

Note: this script is destructive by design for fast local/dev setup.

5. Start app:

```bash
bun dev
```

## Useful Commands

```bash
bun dev
bun run build
bun x tsc --noEmit
```

## Deploy (Vercel)

1. Push to GitHub
2. Import repo in Vercel
3. Set env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Build command: `bun run build` (usually auto-detected)

If the repo is public, Vercel Hobby works well for low-cost demos/portfolio hosting.

## Project Structure

```text
app/
  page.tsx                    # Feed de permutas
  deal/[id]/page.tsx          # Detalhes da permuta
  book/[dealId]/page.tsx      # Candidatura
  booking-success/page.tsx    # Confirmação
  actions/booking.ts          # Server Action + RPC flow

components/
  BookingForm.tsx

lib/
  mock-data.ts
  supabase/
    env.ts
    client.ts
    server.ts
    types.ts

supabase/
  schema.sql
```

## Roadmap (Short)

- Real filters (nicho, plataforma, seguidores)
- Auth (Email + Instagram OAuth)
- Dashboard de creators (status das candidaturas)
- Dashboard de restaurantes (aprovar/rejeitar)

## License

MIT
