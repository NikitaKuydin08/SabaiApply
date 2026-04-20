# SabaiApply

## 1. What Is SabaiApply?

SabaiApply is a Thai university application platform. It has two distinct sides:

- **Student Side** — Profile building, portfolio creation, program browsing, eligibility checking, applications, tracking, interview booking, and results.
- **University Side** — Faculty/admissions management, program setup, application review, scoring, and interview scheduling.

Two co-founders each own one side end-to-end. Code changes should respect this domain boundary.

---

## 2. Tech Stack

| Layer          | Tool                                          |
| -------------- | --------------------------------------------- |
| Framework      | **Next.js 16** (App Router) — see §3 below    |
| Language       | TypeScript (strict mode)                       |
| Database + Auth| Supabase (PostgreSQL + Auth + Storage)         |
| Hosting        | Vercel (auto-deploy from `main`)               |
| Domain         | sabaiapply.com via Namecheap → Vercel          |
| Email          | Resend (transactional emails)                  |
| CSS            | Tailwind CSS v4 + shadcn/ui v4                 |
| UI Components  | shadcn/ui, Lucide React icons                  |
| Containerization | Docker + Docker Compose + Makefile           |
| Path Alias     | `@/*` → `./src/*`                              |

---

## 3. ⚠️ Next.js Version Warning

> **This is NOT the Next.js you know.**

This project runs **Next.js 16.2.3** which has breaking changes from earlier versions. APIs, conventions, and file structure may differ from your training data.

**Before writing any code, you MUST:**
1. Read the relevant guide in `node_modules/next/dist/docs/` for the feature you are modifying.
2. Heed all deprecation notices.
3. Do **not** assume APIs from Next.js 13/14/15 still work the same way.

---

## 4. Project Structure

```
SabaiApply/
├── AGENTS.md              # Shared agent rules (read by all AI agents)
├── CLAUDE.md              # Claude-specific project context
├── GEMINI.md              # This file — Gemini-specific project context
├── Dockerfile             # Multi-stage build (node:24-alpine)
├── docker-compose.yml     # Single service on port 3000
├── Makefile               # make up / dev / down / re / fclean / prune / list
├── docs/
│   ├── api/
│   │   ├── endpoints.md   # Server Actions & route handler contracts
│   │   └── rest.md        # Supabase client + PostgREST + Storage API patterns
│   ├── db/
│   │   ├── index.md       # Table index with links
│   │   ├── schema.md      # Full schema overview (enums, triggers, RLS)
│   │   └── tables/        # Per-table markdown docs (18 tables)
│   ├── i18n/
│   │   └── translation-guide.md  # i18n implementation guide (MUST READ)
│   ├── plans/             # Project plans & progress reports
│   └── references/        # External reference docs (TCAS manual, iFolio)
├── src/
│   ├── app/
│   │   ├── (student)/     # Student-side routes (dashboard, login, signup, profile)
│   │   ├── (uni)/         # University admin routes
│   │   ├── (super)/       # Super admin routes
│   │   ├── auth/          # Auth callback handler
│   │   ├── uni_admin/     # University admin entry
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Landing page
│   │   └── globals.css    # Global styles (Tailwind v4)
│   ├── components/
│   │   ├── ui/            # shadcn/ui primitives
│   │   ├── admin-sidebar.tsx
│   │   ├── language-toggle.tsx
│   │   └── password-input.tsx
│   ├── lib/
│   │   ├── i18n/
│   │   │   ├── context.tsx       # LocaleProvider + useLocale() hook
│   │   │   ├── translations.ts   # Central registry importing all locale JSONs
│   │   │   └── locales/          # Translation JSON files (admin, app, dash, faq, form, …)
│   │   ├── supabase/
│   │   │   ├── client.ts         # Browser Supabase client
│   │   │   ├── server.ts         # Server Supabase client
│   │   │   └── service.ts        # Service-role Supabase client
│   │   ├── email.ts              # Resend email helpers
│   │   ├── rbac.ts               # Role-based access control helpers
│   │   ├── utils.ts              # General utilities (cn, etc.)
│   │   ├── thai-universities.ts  # Static Thai university data
│   │   ├── thai-faculties.ts     # Static Thai faculty data
│   │   └── thai-programs.ts      # Static Thai program data
│   ├── types/                    # TypeScript type definitions
│   └── proxy.ts                  # Dev proxy configuration
├── supabase/                     # Supabase local config (if present)
└── public/                       # Static assets
```

---

## 5. Mandatory Rules

### 5.1 Documentation — READ Before You Write

All API, Database schemas, and architectural docs live in `docs/`.

- **BEFORE** making any backend or database changes, **READ** the relevant docs to ensure consistency.
- **AFTER** changing API endpoints, Server Actions, or Database schema, you **MUST immediately update** the corresponding markdown in `docs/`.

| What changed                | Update this doc                              |
| --------------------------- | -------------------------------------------- |
| Server Action or API route  | `docs/api/endpoints.md` and `docs/api/rest.md` |
| Database table or column    | `docs/db/schema.md` and `docs/db/tables/<table>.md` |
| Enum type                   | `docs/db/schema.md` (Enum Types section)     |
| RLS policy                  | `docs/db/schema.md` (RLS section)            |
| Storage bucket              | `docs/db/schema.md` (Storage section) and `docs/api/rest.md` |

### 5.2 Internationalization (i18n) — Follow the Guide

When adding or updating any translations or localized strings, you **MUST** follow `docs/i18n/translation-guide.md` exactly. Summary of key rules:

1. **File location**: All translation JSONs live in `src/lib/i18n/locales/`.
2. **Key format**: Use dot-notation `[domain].[feature]` (e.g., `form.submit`, `dash.welcome`).
3. **Both languages**: Every key must define both `"en"` and `"th"` values.
4. **Register new files**: If you create a new locale JSON, import and spread it in `src/lib/i18n/translations.ts`.
5. **Usage in components**: Use `const { t } = useLocale()` from `@/lib/i18n/context`, then `t("key")`.
6. **Data models**: Use `TranslationKey` type from `@/lib/i18n/translations` for type-safe keys in config objects. Resolve to strings only at render time via `t()`.
7. **No hardcoded strings**: All user-facing text must go through the `t()` function.

### 5.3 Git Branch Strategy

```
main              ← production (auto-deploys to Vercel) — NEVER push directly
  └── dev         ← integration branch — merge here first, test, then PR to main
        ├── student/auth
        ├── student/profile
        ├── student/portfolio
        ├── student/browse
        ├── student/apply
        └── student/track
```

- **Never push directly to `main`.** Always go through `dev`.
- Work on `student/` or `uni/` feature branches → merge to `dev` → test → PR to `main`.

### 5.4 Database Rules

- **Never change the database schema unilaterally.** Both founders must agree first.
- The **`applications`** table is shared. Students write on apply/submit; University side reads and updates status. Be careful with concurrent access.
- **All student file uploads go to Supabase Storage.** Use signed URLs for secure access. Never expose raw storage bucket paths.

---

## 6. Database Schema Quick Reference

### Enum Types
- **`user_role`**: `'student'` | `'uni_admin'` | `'faculty_admin'`
- **`score_type`**: `TGAT` | `TPAT` | `A-Level` | `IELTS` | `TOEFL` | `Duolingo` | `CU-TEP` | `IB` | …
- **`doc_type`**: `transcript` | `id_copy` | `passport_copy` | `high_school_diploma` | `english_proficiency_cert` | `recommendation_letter` | …

### Student-Side Tables (you write to these)
| Table                    | Purpose                                         |
| ------------------------ | ----------------------------------------------- |
| `profiles`               | General user profile (auto-created by trigger)   |
| `student_profiles`       | Student demographics & contact info              |
| `student_education`      | High school, GPAX, curriculum, study plan         |
| `student_family`         | Family background, parents, income               |
| `student_scores`         | Standardized test scores (TGAT, IELTS, etc.)     |
| `student_subject_scores` | Per-subject grade records                         |
| `student_documents`      | Uploaded documents (transcript, ID, certs)        |
| `student_portfolios`     | Portfolio collections with essays                 |
| `portfolio_items`        | Individual achievements/activities                |
| `portfolio_item_files`   | File attachments for portfolio items              |

### University-Side Tables (read-only for students)
`universities`, `faculties`, `programs`, `program_requirements`

### Shared Tables (both sides read and write)
`applications`, `interview_slots`

### Detailed per-table docs
See `docs/db/tables/<table_name>.md` for column definitions, types, and constraints.

---

## 7. API / Backend Patterns

SabaiApply uses a **thin backend** architecture:

1. **Supabase Client (PostgREST)** — For standard CRUD via `@supabase/supabase-js` with RLS enforcement. Use `createClient()` (server) or `createBrowserClient()` (browser) from `src/lib/supabase/`.

2. **Next.js Server Actions** — For privileged mutations and operations requiring external services (email, admin operations). These are `'use server'` functions.

3. **Supabase Storage** — For file uploads. Students upload to `bucket_name/[user.id]/...` so RLS scopes access automatically.

### Supabase Client Usage

```typescript
// Server-side
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();

// Client-side
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

// Service-role (admin bypass — use sparingly)
import { createClient } from "@/lib/supabase/service";
```

### Storage Buckets
| Bucket       | Access                              |
| ------------ | ----------------------------------- |
| `documents`  | Private — owner + faculty admins    |
| `portfolios` | Private — owner + faculty admins    |
| `photos`     | Public read (avatars)               |
| `logos`      | Public read, admin-writable         |

---

## 8. Running the Project

### Local Development (Docker — Recommended)

```bash
make up          # Build & start container in background (port 3000)
make dev         # Build & start with watch mode (hot reload)
make re          # Stop, rebuild, and restart
make down        # Stop containers
make fclean      # Full cleanup (all containers, images, volumes)
make list        # Show running containers and volumes
```

### Local Development (npm)

```bash
npm install      # Install dependencies
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Environment Variables
All env vars are in `.env` (git-ignored). Required Supabase keys:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, never exposed to client)

---

## 9. Component & Styling Conventions

- **UI primitives**: Use shadcn/ui components from `src/components/ui/`.
- **Icons**: Use `lucide-react`.
- **Styling**: Tailwind CSS v4. Utility classes in JSX. Global styles in `src/app/globals.css`.
- **Class merging**: Use `cn()` from `@/lib/utils` (wraps `clsx` + `tailwind-merge`).
- **Client components**: Mark with `'use client'` directive at the top.
- **Server components**: Default in App Router — no directive needed.

---

## 10. Auth Flow

1. Supabase Auth (email + password).
2. On signup, a database trigger (`handle_new_user`) auto-creates rows in `profiles` and conditionally in `student_profiles`.
3. Auth callback at `/auth/callback` handles PKCE code exchange.
4. Route protection via middleware and server-side session checks.
5. Role-based access: `student`, `uni_admin`, `faculty_admin` — enforced by both RLS and application-level RBAC (`src/lib/rbac.ts`).

---

## 11. Pre-Flight Checklist

Before submitting any changes, verify:

- [ ] Read `node_modules/next/dist/docs/` for any Next.js feature you touched.
- [ ] All user-facing strings use `t()` with both `en` and `th` translations.
- [ ] New locale JSON files are registered in `src/lib/i18n/translations.ts`.
- [ ] API/DB docs in `docs/` are updated if you changed endpoints, actions, or schema.
- [ ] No hardcoded English or Thai text in components.
- [ ] No raw Supabase Storage paths exposed — use signed URLs.
- [ ] TypeScript compiles cleanly (`npm run build` or `make re`).
- [ ] Code is on a feature branch, not `main`.

---

## 12. Key File Reference

| Purpose                      | Path                                       |
| ---------------------------- | ------------------------------------------ |
| Root layout                  | `src/app/layout.tsx`                       |
| Landing page                 | `src/app/page.tsx`                         |
| Global CSS                   | `src/app/globals.css`                      |
| Student layout               | `src/app/(student)/layout.tsx`             |
| Student dashboard            | `src/app/(student)/dashboard/`             |
| Admin layout & actions       | `src/app/(uni)/admin/`                     |
| Supabase clients             | `src/lib/supabase/{client,server,service}.ts` |
| i18n context & hook          | `src/lib/i18n/context.tsx`                 |
| Translation registry         | `src/lib/i18n/translations.ts`             |
| Translation files            | `src/lib/i18n/locales/*.json`              |
| Translation guide            | `docs/i18n/translation-guide.md`           |
| API docs                     | `docs/api/{endpoints,rest}.md`             |
| DB schema docs               | `docs/db/{schema,index}.md`               |
| Per-table docs               | `docs/db/tables/*.md`                      |
| Next.js config               | `next.config.ts`                           |
| TypeScript config            | `tsconfig.json`                            |
| Docker config                | `Dockerfile` + `docker-compose.yml`        |
| Build commands               | `Makefile`                                 |
