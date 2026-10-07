# Kings Engineering College

Campus Digital Learning & Smart Attendance Platform is a production-oriented Next.js and Supabase application for smart attendance, LMS workflows, library resources, online tests, assignments, realtime collaboration, analytics, gamification, and AI-assisted learning.

## Stack

- Next.js 15, React 19, TypeScript
- TailwindCSS with ShadCN-style primitives
- Framer Motion-ready UI structure
- React Hook Form and Zod validation
- Supabase Auth, PostgreSQL, Realtime, Storage, and RLS
- Recharts analytics
- Vercel deployment target

## App Surface

Student routes:

- `/dashboard`, `/profile`, `/attendance`, `/tests`, `/assignments`, `/resources`, `/library`, `/chat`, `/leaderboard`, `/certificates`, `/achievements`, `/calendar`

Faculty routes:

- `/faculty/dashboard`, `/faculty/classes`, `/faculty/attendance`, `/faculty/tests`, `/faculty/assignments`, `/faculty/resources`, `/faculty/reports`, `/faculty/chat`

Admin routes:

- `/admin/dashboard`, `/admin/users`, `/admin/students`, `/admin/faculty`, `/admin/departments`, `/admin/attendance`, `/admin/attendance/live`, `/admin/tests`, `/admin/question-bank`, `/admin/questions`, `/admin/resources`, `/admin/library`, `/admin/assignments`, `/admin/reports`, `/admin/chats`, `/admin/settings`

## Supabase Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENAI_API_KEY=
```

3. Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor or through the Supabase CLI.
4. Enable Auth providers:
   - Email password
   - Magic link
   - Google OAuth
   - GitHub OAuth
5. Create storage buckets:
   - `avatars`
   - `resources`
   - `submissions`
   - `certificates`
6. Enable Realtime for:
   - `attendance_sessions`
   - `attendance`
   - `messages`
   - `notifications`
   - `leaderboards`
   - `assignment_submissions`

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The app renders without Supabase credentials for UI review. Add credentials to enable authentication, protected data access, attendance verification writes, and realtime flows.

## Security Model

- Supabase Auth for identity
- Role-based access through `profiles.role`
- RLS enabled on all application tables
- Server-side Zod validation for attendance and AI endpoints
- Attendance audit logs with IP, browser, location, device, face confidence, and distance
- Duplicate attendance blocked with a unique session/student constraint
- QR session expiry, geofence radius, face confidence, and device logging are enforced server side
- Admin-only audit log visibility

## AI Assistant

`/api/ai/study-assistant` validates prompts and returns a structured revision plan. It is intentionally implemented with a local deterministic fallback so the platform is useful before adding a paid provider. Wire `OPENAI_API_KEY` into that route when you want live model responses.

## Reports

`/api/reports/export` returns a CSV campus analytics export. The schema includes `reports` storage for generated CSV, Excel, and PDF report artifacts.

## Deployment

1. Push this project to GitHub.
2. Import the repo into Vercel.
3. Add the environment variables from `.env.example`.
4. Set Supabase Auth redirect URLs:
   - `https://your-domain.vercel.app/dashboard`
   - `http://localhost:3000/dashboard`
5. Run the Supabase migration in production.
6. Enable Realtime on the configured tables.
7. Deploy.

## Production Checklist

- Configure Google and GitHub OAuth apps.
- Add Supabase Storage policies for the four buckets.
- Add a transactional email provider for verification and reminders.
- Add push notification service worker and VAPID keys.
- Connect OpenAI or another AI provider in `/api/ai/study-assistant`.
- Add rate limiting at the edge for auth, attendance, AI, and exports.
- Add Sentry or equivalent error monitoring.
- Add Playwright coverage for login, role dashboards, attendance verification, assignment submission, and test submission.
- Add database backups and point-in-time recovery.
- Review RLS policies with representative admin, faculty, and student accounts.

## Testing Guide

```bash
npm run typecheck
npm run lint
npm run build
```

Recommended test coverage:

- Unit tests for geofence distance, attendance validation, and role helpers
- Integration tests for Supabase RLS policies
- Playwright tests for role navigation and responsive dashboards
- Load tests for realtime attendance sessions and chat rooms
