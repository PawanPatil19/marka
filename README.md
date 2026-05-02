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



*Built for athletes who log every finish line.*
