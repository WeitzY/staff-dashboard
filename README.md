# Staff Dashboard (Portfolio)

![Demo GIF](demo.gif)

👉 **[🌐 Staff Dashboard Live](https://staff-dashboard-beryl.vercel.app/login)**

Demo account: `resume@test.com` / `Resume123` *(read-only — editing disabled)*

👉 **[💬 Guest Chat Live](https://chat-dashboard-tau-seven.vercel.app/)**

👉 **[📂 Staff Dashboard Repo](https://github.com/WeitzY/staff-dashboard)**
👉 **[📂 Guest Chat Repo](https://github.com/WeitzY/chat-dashboard)**
👉 **[📂 Core Functions Repo](https://github.com/WeitzY/core-dashboard-staff)**

---

## About

Production-style staff dashboard demonstrating my **Frontend / Full-stack** skills with a focus on **UX, real-time data, and clean architecture**.

---

## What this showcases

* **Modern stack**: Next.js App Router, React 19, Tailwind v4, Shadcn/UI, SWR
* **Supabase**: Auth, Postgres, and Realtime for instant updates
* **Real-time requests**: Staff see new guest requests immediately and can update status
* **Role-aware UI**: Basic staff/admin capabilities with guarded routes
* **Simplified AI flow**: Guest message → AI answers from FAQs/items and, if relevant, creates a request (stateless per message)

---

## Tech highlights

* Built for **Vercel deployment**, single-region Supabase
* Dark/light theme, responsive layout, keyboard/focus states

---

## Notes & scope

* Portfolio project – some flows intentionally simplified:
  * Conversation stateless per message (no long history/context)
  * Email confirmation skipped in demo sign-up flows
* Mobile responsive (solid but not pixel-perfect on all screens)

---

## Structure

```
src/app         → App Router pages, layouts, global styles
src/components  → Feature & UI components (shadcn/ui based)
src/hooks       → Data/feature hooks (SWR + Supabase)
src/services    → Request create/update helpers
src/lib/supabase → Browser/server clients & types
```

For deeper AI implementation context → see `staff-dashboard.md`.
