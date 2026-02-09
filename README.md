# Feater Web - Restaurant Deals Platform

A modern, mobile-first web application for discovering and booking restaurant deals. Built with Next.js 15, Supabase, and Tailwind CSS.

## Features

- 🎯 **List View**: Browse all available restaurant deals
- 📱 **Mobile-First**: Optimized for mobile devices with PWA support
- 🔍 **Deal Details**: View comprehensive information about each deal
- 📅 **Booking System**: Complete booking flow with form validation
- ⚡ **Real-time Updates**: Live availability updates
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- 🚀 **Fast Performance**: Server-side rendering with Next.js 15

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Vercel (recommended)
- **PWA**: next-pwa

## Quick Start

### 1. Clone and Install

```bash
cd feater-web
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Settings** → **API**
3. Copy your project URL and anon key

### 3. Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Open the file `supabase/schema.sql` from this project
3. Copy and paste the entire content into the SQL Editor
4. Click **Run**

This will create:
- `restaurants` table
- `deals` table
- `bookings` table
- Row Level Security policies
- Sample data (4 restaurants + 5 deals)

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
feater-web/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page (deal list)
│   ├── deal/[id]/page.tsx      # Deal details
│   ├── book/[dealId]/page.tsx  # Booking page
│   └── booking-success/page.tsx # Success page
├── components/
│   └── BookingForm.tsx         # Client-side booking form
├── lib/
│   └── supabase/
│       ├── client.ts           # Client-side Supabase
│       ├── server.ts           # Server-side Supabase
│       └── types.ts            # Database types
├── public/
│   └── manifest.json           # PWA manifest
└── supabase/
    └── schema.sql              # Database schema
```

## Features Overview

### Home Page (`/`)
- Lists all active deals
- Shows restaurant info, discount percentage, availability
- Server-side rendered for SEO
- Revalidates every 60 seconds

### Deal Details (`/deal/[id]`)
- Detailed deal information
- Restaurant details
- Available days and validity period
- Fixed bottom CTA button

### Booking Page (`/book/[dealId]`)
- Form with user information
- Date picker (within deal validity)
- Number of people selector
- Special requests field
- Real-time availability check

### Success Page (`/booking-success`)
- Confirmation message
- Booking details summary
- Next steps information

## Database Schema

### Restaurants
- Basic info (name, description, category)
- Images and Instagram handle
- Address

### Deals
- Connected to restaurants
- Discount percentage
- Availability (spots, dates, days)
- Max people per booking

### Bookings
- User information
- Connected to deals
- Status (pending/confirmed/cancelled)
- Booking date and notes

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

Your app will be live in ~2 minutes with automatic HTTPS and global CDN.

### PWA Installation

Once deployed:
- **iOS**: Open in Safari → Share → Add to Home Screen
- **Android**: Chrome will prompt to install, or use menu → Install app

## Customization

### Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    DEFAULT: "#FF6B35",  // Your brand color
    light: "#FF8C61",
    dark: "#E55A2B",
  },
}
```

### Images

Replace placeholder images in the database with real images:
- Use Supabase Storage for uploads
- Or use external URLs (Unsplash, Cloudinary, etc.)

## Performance

- **Server-side rendering** for instant page loads
- **Image optimization** with Next.js Image component
- **Automatic code splitting** for faster navigation
- **60s revalidation** for fresh data without constant queries

## Security

- Row Level Security (RLS) enabled on all tables
- Server-side data fetching prevents API key exposure
- Form validation on both client and server
- Protected routes with Supabase auth (ready to add)

## Next Steps

1. **Add Authentication**: Implement sign-up/sign-in with Supabase Auth
2. **User Dashboard**: Let users view their booking history
3. **Restaurant Dashboard**: Let restaurants manage their deals
4. **Push Notifications**: Notify users about booking confirmations
5. **Search & Filters**: Add search by category, location, date
6. **Reviews**: Let users review restaurants after visits
7. **Payment Integration**: Add Stripe for prepayment/deposits

## Troubleshooting

**Issue**: "Module not found" errors
- Run `npm install` again
- Delete `node_modules` and `.next`, then reinstall

**Issue**: Supabase connection fails
- Check your `.env.local` file
- Ensure variables start with `NEXT_PUBLIC_`
- Restart dev server after changing env vars

**Issue**: Database queries fail
- Verify you ran the schema.sql in Supabase
- Check RLS policies are enabled
- Check table names match exactly

## License

MIT

## Support

For issues or questions, please open an issue on GitHub or contact the development team.

---

Built with ❤️ using Next.js 15 and Supabase
