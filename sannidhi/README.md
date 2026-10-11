# Sannidhi

Temple software for Hindu temples in the US, with a simple feed that connects each temple to its devotees.

- **Temples** post updates, darshan photos, events and urgent notices, and keep a live "today" status (open hours, aarti time, parking).
- **Devotees** follow temples, pray, comment, share and RSVP with a headcount. Devotees can't post, which keeps the feed free of spam.
- **No payments.** Donate buttons link out to each temple's own processor.

## Layout

```
apps/mobile/           Expo app (iOS, Android, web). Phase 1 runs on local demo data.
supabase/migrations/   Postgres schema with row-level security for Phase 1.
```

## Run the app

```bash
cd apps/mobile
npm install
npx expo start          # press w for web, i for iOS simulator, a for Android
```

Checks before committing:

```bash
npx tsc --noEmit
npx expo lint
```

## Phase 1 status

| Area | State |
| --- | --- |
| Language onboarding (6 Indian languages + English) | Done |
| Home feed, Today card, temple row | Done |
| Pray, comment, share | Done |
| Temple profile (posts, events, about, unclaimed notice) | Done |
| Event detail with headcount RSVP | Done |
| Temple composer (type, photo, attach event, Telugu version) | Done |
| Supabase schema + RLS | Written, not yet wired to the app |
| Auth, push notifications, temple web dashboard | Next |

Demo data in `apps/mobile/src/data/seed.ts` is fictional. Photo credits are in `apps/mobile/ASSET-CREDITS.md`.
