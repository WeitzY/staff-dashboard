# Staff Dashboard (Portfolio)

Purpose-built, production-style dashboard demonstrating my Frontend/Full‑stack skills with a focus on UX, real‑time data, and clean architecture.

### What this showcases
- **Modern stack**: Next.js App Router, React 19, Tailwind v4, Shadcn/UI, SWR
- **Supabase**: Auth, Postgres, and Realtime for instant updates
- **Real-time requests**: Staff see new guest requests immediately and can update status
- **Role-aware UI**: Basic staff/admin capabilities and guarded routes
- **Simplified AI flow**: Guest message → AI answers from FAQs/items and (if relevant) creates a request. Each message is stateless by design.

### Live + Tech
- Built for Vercel deployment, single-region Supabase
- Dark/light theme, responsive layout, keyboard/focus states

### Try it live
- Link: coming soon (Vercel)
- Demo account for viewing only: `resume@test.com` / `Resume123`
- Note: Editing is intentionally restricted for this demo account (cannot change password or modify staff/hotel data). This is by design to protect the demo.

### Notes and scope
- This is a portfolio project. Some flows are simplified on purpose:
  - Conversation is stateless per message (no long history/context)
  - Email confirmation is skipped in demo sign‑up flows
- Mobile is solid but not pixel‑perfect on all screens

### Structure
- `src/app` App Router pages, route layouts, global styles
- `src/components` Feature and UI components (shadcn/ui based)
- `src/hooks` Data/feature hooks (SWR + Supabase)
- `src/services` Request create/update helpers
- `src/lib/supabase` Browser/server clients and types

For deeper implementation context for AI tools, see `staff-dashboard.md`.
