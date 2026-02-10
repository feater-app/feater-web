# Feater Web - Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Create Supabase Project (2 minutes)

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - Name: `feater` (or anything you want)
   - Database Password: (create a strong password)
   - Region: Choose closest to you
4. Wait ~2 minutes for project to be created

### Step 2: Set Up Database (1 minute)

1. In Supabase dashboard, click "SQL Editor" (left sidebar)
2. Click "New query"
3. Open `supabase/schema.sql` from this project
4. Copy ALL the content
5. Paste into SQL Editor
6. Click "Run" (bottom right)
7. You should see "Success" - tables and sample data are now created!

If you already ran an older schema before this update, re-run the latest `supabase/schema.sql` so the atomic booking function (`create_booking_with_spot`) is created.

### Step 3: Get API Credentials (30 seconds)

1. In Supabase dashboard, click "Settings" (left sidebar)
2. Click "API"
3. You'll see:
   - **Project URL** (starts with https://)
   - **anon public** key (long string)
4. Keep this page open!

### Step 4: Configure App (30 seconds)

1. In this project, copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and paste your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-long-anon-key-here
   ```

### Step 5: Run the App! (1 minute)

```bash
bun install
bun dev
```

Open http://localhost:3000 - you should see 5 restaurant deals! 🎉

## What You Get Out of the Box

✅ **4 Sample Restaurants**:
- Bella Italia (Italian)
- Sushi Master (Japanese)
- Burger House (American)
- Taco Loco (Mexican)

✅ **5 Active Deals**:
- 50% OFF Pizza Night
- Sushi Combo for 2
- Buy 1 Get 1 Free Burgers
- Taco Tuesday
- Weekend Brunch Special

✅ **Full Booking Flow**:
- Browse deals
- View details
- Book with form
- See confirmation

## Testing the Booking Flow

1. Click any deal card
2. Click "Book Now"
3. Fill in the form:
   - Name: John Doe
   - Email: test@example.com
   - Phone: (optional)
   - Select 2 people
   - Pick a date
4. Click "Confirm Booking"
5. See success page!

## View Your Bookings in Supabase

1. Go back to Supabase dashboard
2. Click "Table Editor" (left sidebar)
3. Click "bookings" table
4. See your test booking! 📋

## Deploy to Production (5 minutes)

### Option 1: Vercel (Recommended - FREE)

1. Push code to GitHub
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your GitHub repo
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: (your Supabase URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (your Supabase key)
6. Click "Deploy"
7. Your app is LIVE! 🚀

### Option 2: Netlify

1. Push code to GitHub
2. Go to https://netlify.com
3. Click "Add new site" → "Import existing project"
4. Connect GitHub and select repo
5. Add environment variables (same as above)
6. Click "Deploy"

## Next Steps

### Customize Sample Data

Edit `supabase/schema.sql` to add your own restaurants and deals, then re-run it in SQL Editor.

### Add Real Images

Replace the Unsplash URLs with:
- Your own images in Supabase Storage
- Your restaurant photos
- Or keep using Unsplash (free!)

### Add Authentication (Optional)

Supabase Auth is already configured. To add sign-up/sign-in:

1. In Supabase dashboard: Authentication → Providers
2. Enable Email provider
3. Add sign-up page to your app
4. Use `supabase.auth.signUp()` and `supabase.auth.signIn()`

### Add More Features

Ideas to extend:
- Search and filters
- User dashboard (view bookings)
- Restaurant dashboard (manage deals)
- Reviews and ratings
- Payment integration
- Email notifications
- Social sharing

## Troubleshooting

**"Module not found" error**
```bash
rm -rf node_modules bun.lock
bun install
```

**Can't connect to Supabase**
- Check your `.env.local` file
- Make sure you have NEXT_PUBLIC_ prefix
- Restart dev server: stop (Ctrl+C) then `bun dev`

**No deals showing**
- Make sure you ran the schema.sql in Supabase
- Check Supabase Table Editor → deals table has data
- Check browser console for errors

**TypeScript errors**
```bash
bunx tsc --noEmit
```

**Build errors**
```bash
rm -rf .next
bun dev
```

## Getting Help

- Check the main README.md
- Review Supabase docs: https://supabase.com/docs
- Review Next.js docs: https://nextjs.org/docs

---

🎉 **Congratulations!** You now have a fully functional restaurant deals platform!
