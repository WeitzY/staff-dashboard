# Staff Dashboard (`staff-dashboard`)

## 1) Purpose
- Portfolio-quality hotel staff dashboard. Goal: demonstrate strong Frontend/Full‑stack skills for job applications.
- Priorities: excellent UX, clean architecture, safe data access, and fast iteration.

## 2) Product Scope
- Live requests board: CRUD on staff requests from table `staff_notes` with real‑time updates.
- Content: manage `items` and `faq_info` tables.
- Staff: basic create/update/delete in `hotel_staff`.
- Hotel config: update departments, languages, defaults in `hotels`.
- Auth: Supabase Auth; all dashboard routes require an authenticated staff user.
- AI/chat policy (simplified by design): Each guest message is handled statelessly. The AI answers from FAQs/items and may create a request. No conversation history is kept.

## 3) Tech & Architecture
- Next.js App Router + React 19 + TypeScript
- Styling: Tailwind CSS v4, shadcn/ui components
- Data: Supabase (Postgres, Auth, Realtime)
- Client data layer: SWR + feature hooks encapsulating queries/mutations
- SSR where appropriate (protected routes use server checks)

### Key directories
- `src/app` pages/layouts, server components where needed
- `src/components` UI and feature components
- `src/hooks` feature hooks: `useRequests`, `useRequestsRealtime`, `useItems`, `useFAQs`, `useStaffManagement`, `useHotelManagement`, `useProfile`
- `src/services` side‑effect helpers for request creation/update
- `src/lib/supabase` browser/server clients and generated types

## 4) Data Model (minimal set used here)
- `hotels`: id, departments[], languages[], default_language
- `hotel_staff`: id, user_id, hotel_id, name, role, department, email
- `items`: id, hotel_id, item, description, department, is_active
- `faq_info`: id, hotel_id, title, content, is_active
- `staff_notes`: id, hotel_id, guest_id, room_number, note_content, department, status, is_active, created_by_name
- `guests`: id, hotel_id, room_number, last_name

All queries must be filtered by `hotel_id` via RLS. Client code derives `hotel_id` by looking up the current user's `hotel_staff` profile.

## 5) Security & RLS
- Only authenticated staff can access dashboard routes.
- RLS is assumed on all tables, keyed on `hotel_id` (and `user_id` for staff profiles).
- Client code never trusts inputs; sanitize text fields used in forms.

## 6) Realtime
- Realtime channel per hotel: subscribes to changes on `staff_notes` filtered by `hotel_id`.
- Deduplicate subscriptions using a global guard to avoid double subscribe in Strict Mode/HMR.

## 7) UX Notes
- Responsive layout with dark/light themes. Keyboard/focus visible by default.
- Tables are paginated or virtualized where needed, with SWR caching.
- Toasts for success/error feedback.

## 8) Non‑Goals (intentional for portfolio scope)
- No long chat history or retrieval chains.
- Email confirmations and admin cleanup flows are skipped/simplified.
- Only the minimum entities and columns required for demo are used.

## 9) Setup
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Vercel: add the two env vars and connect the Git repo; build with default Next.js settings.

## 10) AI Assistant Guidance
- Prefer adding logic inside `src/hooks/*` to keep components thin.
- When adding features, secure by `hotel_id` first; then implement UI.
- Keep code readable and typed; avoid `any`.

This file is optimized for tool use—short, precise, and aligned to what exists in the repo.