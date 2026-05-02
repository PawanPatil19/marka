# MARKA

> *marka* — a mark, a stamp, a finish line crossed.

A race log for endurance athletes who take their sport seriously. Built brutalist, moves fast, earns badges.

---

## What it is

You finish a race. You log it. That's the core loop.

But over time, Marka builds a picture of who you are as an athlete — every country you've raced in, every distance you've conquered, every milestone you've hit. Your race history becomes a passport.

No social feed. No leaderboards. No clutter. Just your data, sharp and clean.

---

## Features

**Race Log**
Log any race across triathlon, running, cycling, duathlon, and open water. Record your finish time, split times, overall rank, age group rank, and notes. Every race gets a permanent record.

**Passport & Badges**
Badges are earned automatically when you log races — no manual claiming.

| Badge type | How you earn it |
|---|---|
| Geography | Race in a new country |
| Milestones | First finish, 70.3, Ironman, Marathon, Ultra |
| Count | 5, 10, 25, 50 races finished |

**Personal Bests**
Automatically tracks your fastest time per sport + distance category.

**Discover**
A curated calendar of upcoming endurance races across Asia and beyond. Mark the ones you're attending with *I'M IN* — they show up in a dedicated section so you know what's next.

**Strava Import**
Connect Strava once and pull your race activities directly into your log.

**Public Share Page**
Your race history, shareable at `marka.app/share/[username]`.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | Supabase (Postgres + RLS) |
| Auth | Supabase Auth (magic link) |
| Styling | Tailwind CSS v4 |
| Hosting | Vercel |
| Tests | Jest |

No ORMs. No UI libraries. Direct SQL through a typed `db` module. Server components and server actions throughout — minimal client JS.

---

## Design

Brutalist editorial. Think sports newspaper, not fitness app.

- `#f0ebe0` — warm off-white background
- `#e8001d` — racing red for accents and alerts
- `#111` — near-black for type and borders
- Barlow Condensed — heavy, uppercase display type
- Space Mono — data labels, metadata, monospace everything

---

## Local setup

```bash
# 1. Clone and install
git clone https://github.com/PawanPatil19/marka.git
cd marka
npm install

# 2. Set environment variables
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
# Optional: ADMIN_USER_ID (your Supabase user ID for admin access)
# Optional: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET

# 3. Run migrations
# Apply the SQL files in /supabase to your Supabase project

# 4. Start dev server
npm run dev
```

---

## Project structure

```
src/
├── app/                  # Pages and routes
│   ├── page.tsx          # Home dashboard
│   ├── races/            # Race log + detail + edit
│   ├── passport/         # Badges and personal bests
│   ├── discover/         # Race calendar
│   ├── profile/          # Settings + Strava
│   ├── share/[username]/ # Public profile
│   └── admin/            # Admin: manage discover races
├── components/           # Shared UI components
└── lib/
    ├── db.ts             # All database queries
    ├── badges.ts         # Badge computation logic
    ├── races.ts          # Race server actions
    ├── discover.ts       # Discover server actions
    ├── auth.ts           # Auth helpers (requireUser, requireAdmin)
    └── types.ts          # Shared TypeScript types
```

---

## Tests

Badge logic is fully unit tested — the most complex pure function in the codebase.

```bash
npm test
```

---

## Admin

Set `ADMIN_USER_ID` in your environment to your Supabase user ID. The `/admin` route lets you add, edit, and delete races in the Discover calendar.

---

*Built for athletes who log every finish line.*
