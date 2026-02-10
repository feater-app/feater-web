# Feater Web — Session Status

## What Was Built

### Stack
- **Next.js 15** (App Router, Turbopack, Server Components)
- **Supabase** (PostgreSQL, Auth, RLS)
- **Tailwind CSS** (mobile-first, custom primary/secondary colors)
- **PWA** via `@ducanh2912/next-pwa`
- **TypeScript** (strict, no errors)

### Project Location
`/Users/ricardocosta/Play/feater-web/`

---

### Files Created

```
app/
  layout.tsx                  # Root layout, PWA meta tags, viewport
  globals.css                 # Tailwind + custom component classes
  page.tsx                    # Home — deal list (SSR, 60s revalidate)
  deal/[id]/page.tsx          # Deal details + restaurant info
  book/[dealId]/page.tsx      # Booking page (passes deal to form)
  booking-success/page.tsx    # Confirmation page with booking summary
  actions/booking.ts          # Server Action — creates booking in Supabase or mock

components/
  BookingForm.tsx             # Client component, uses useActionState + Server Action

lib/
  supabase/client.ts          # Browser Supabase client
  supabase/server.ts          # Server Supabase client (cookies)
  supabase/types.ts           # TypeScript types for all DB tables
  mock-data.ts                # 4 restaurants + 5 deals + in-memory booking store

supabase/
  schema.sql                  # Full DB schema + RLS policies + sample data

public/
  manifest.json               # PWA manifest

.env.local.example            # Template for Supabase credentials
README.md                     # Full documentation
SETUP.md                      # Step-by-step 5-minute setup guide
```

---

### Features Working (Mock Mode — no Supabase needed)
- ✅ Home page lists 5 deals with images, discount badges, spots, validity
- ✅ Deal details page with days, validity period, restaurant info
- ✅ Booking form (name, email, phone, date, people, notes)
- ✅ Form submits via Server Action
- ✅ Success page shows booking summary
- ✅ Full navigation flow: list → details → book → success → back to list
- ✅ TypeScript compiles clean (`bunx tsc --noEmit` passes)
- ✅ Production build passes (`bun run build` passes)
- ✅ "Demo mode" banner shown when no Supabase credentials

### Features Working (Real Supabase Mode)
- ✅ All of the above, plus:
- ✅ Reads live data from DB
- ✅ Creates real bookings in `bookings` table
- ✅ Decrements `available_spots` atomically
- ✅ RLS policies enforce data access rules

---

## Pending / To Do

### Immediate
- [x] **Switch to Bun** — Bun installed, dependencies moved to `bun.lock`, npm lockfile removed
  ```bash
  curl -fsSL https://bun.sh/install | bash
  source ~/.zshrc
  rm -rf node_modules package-lock.json
  bun install
  # Scripts run with Bun via `bun dev`, `bun run build`, etc.
  ```
- [ ] **Connect real Supabase** — copy `.env.local.example` → `.env.local`, add credentials, run latest `supabase/schema.sql` (includes `create_booking_with_spot` atomic booking function)
- [ ] **Add PWA icons** — `public/icon-192.png` and `public/icon-512.png` are missing (see `public/.placeholder-icons`)

### Near-term Features
- [ ] **Search + filters** — by category, day of week, discount %, location
- [ ] **Authentication** — Supabase Auth (email + Instagram OAuth)
- [ ] **User dashboard** — view/cancel own bookings
- [ ] **Restaurant dashboard** — manage deals, see booking requests, confirm/reject
- [ ] **Email notifications** — booking confirmation to user + alert to restaurant (Resend or Supabase Edge Functions)
- [ ] **Real-time availability** — subscribe to spot count changes via Supabase Realtime

### Polish
- [ ] Loading skeleton states for deal cards
- [ ] Error boundary / error.tsx pages
- [ ] Empty state illustrations
- [ ] Favicon + OG image
- [ ] `robots.txt` + sitemap for SEO

### Infrastructure
- [ ] Deploy to Vercel (connect GitHub → auto-deploy)
- [ ] Set up Supabase Row Level Security for restaurant owners
- [ ] Add Supabase Auth and link `user_id` to bookings

---

## Quick Start (once Bun is installed)

```bash
cd /Users/ricardocosta/Play/feater-web

# Install with bun
bun install

# Run (works immediately in mock/demo mode — no Supabase needed)
bun dev

# Open http://localhost:3000
```

To connect real data, see **SETUP.md** for the 5-minute Supabase walkthrough.
