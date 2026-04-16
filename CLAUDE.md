# SabaiApply — CLAUDE.md (Student Side / Founder A)

> This file tells you — the Claude instance running in VS Code — everything about this project.
> You are helping Founder A, who owns the **Student Side** of SabaiApply end-to-end.

---

## What Is SabaiApply?

SabaiApply is a Thai university application platform. Students use it to build a profile,
attach a portfolio, browse university programs, check their eligibility, apply, track their
application status, book interviews, and see results. Think of it as a centralized TCAS-adjacent
tool with a clean UX.

The project has two co-founders:
- **Founder A (you)** → Student Side — everything students touch
- **Founder B** → University Side — everything faculty/admissions touch

The split is clean: each founder owns a complete product experience end-to-end. No waiting on
each other, no merge conflicts across domains.

---

## Tech Stack (Already Set Up)

| Layer | Tool |
|---|---|
| Framework | Next.js (App Router) |
| Database + Auth | Supabase |
| Hosting | Vercel (auto-deploy from `main`) |
| Domain | sabaiapply.com via Namecheap → Vercel |
| Email | Resend (transactional emails) |
| CSS | Tailwind CSS + shadcn/ui |
| Storage | Supabase Storage (documents, photos) |

Everything is already wired together. The Supabase project exists, the database schema is
already created, Vercel is connected, and the domain points to it.

---

## Database Tables You Own (Student Side)

These tables are already created in Supabase. Do not modify schema without agreeing with Founder B.

```
users
  ├── id (uuid, PK)
  ├── email
  ├── role (student | faculty_admin | uni_admin)
  └── created_at

student_profiles
  ├── id (uuid, PK)
  ├── user_id (FK → users)
  ├── first_name, last_name
  ├── first_name_th, last_name_th
  ├── dob, nationality, gender
  ├── phone, line_id
  ├── address
  └── photo_url

student_education
  ├── id (uuid, PK)
  ├── student_id (FK → student_profiles)
  ├── school_name
  ├── gpa
  ├── graduation_year
  └── transcript_url

student_scores
  ├── id (uuid, PK)
  ├── student_id (FK → student_profiles)
  ├── score_type (GAT | PAT | TGAT | TPAT | O-NET | SAT | IELTS | TOEFL)
  ├── score_value
  └── test_date

student_documents
  ├── id (uuid, PK)
  ├── student_id (FK → student_profiles)
  ├── doc_type (transcript | id_copy | photo | certificate | portfolio)
  ├── file_url
  └── file_name

student_portfolios
  ├── id (uuid, PK)
  ├── student_id (FK → student_profiles)
  ├── title
  ├── source (sabaiapply | tcasfolio | ifolio | freestyle)
  ├── content_json    ← for SabaiApply-built portfolios
  ├── external_url    ← for imported portfolios
  └── pdf_url
```

Tables you READ but do not write (owned by Founder B):

```
universities, faculties, programs, program_requirements
```

Tables that connect both sides (both read and write):

```
applications
  ├── id, student_id (FK), program_id (FK)
  ├── round (1 | 2 | 4)
  ├── status (submitted | under_review | shortlisted | interview_scheduled
  │           | accepted | waitlisted | rejected | confirmed | withdrawn)
  ├── custom_answers (jsonb)
  ├── portfolio_id (FK → student_portfolios)
  ├── submitted_at, reviewed_by, scores (jsonb), total_score
  ├── waitlist_position, notes

interview_slots
  ├── id, program_id (FK), datetime, duration_minutes
  ├── application_id (FK → applications, nullable)
  └── status (available | booked | completed | no_show)
```

---

## Git Branch Strategy

```
main              ← production (auto-deploys to Vercel) — NEVER push directly here
  └── dev         ← integration branch — merge here first, test, then PR to main
        ├── student/auth
        ├── student/profile
        ├── student/portfolio
        ├── student/browse
        ├── student/apply
        └── student/track
```

**Rule:** Always work on a `student/` feature branch → merge to `dev` → test with Founder B
→ merge to `main`.

---

## Your Scope: Week 1–2 Core Build

This is the focused 2-week build plan for the student side. One major feature per day.

### WEEK 1 — Profile & Portfolio

| Day | Feature | What to build |
|-----|---------|---------------|
| Mon | **Auth — Student registration & login** | Email + password via Supabase Auth. Assign `student` role on signup. Protect routes with middleware. |
| Tue | **Profile — Personal info form** | Form: first/last name (EN + TH), DOB, nationality, phone, LINE ID, address, photo upload. Save to `student_profiles`. Photo goes to Supabase Storage. |
| Wed | **Profile — Education & scores** | School name, GPA, graduation year. Add multiple test scores (score type dropdown + value + date). Save to `student_education` and `student_scores`. |
| Thu | **Document vault** | Upload: transcript, ID copy, photo, certificates. Store files in Supabase Storage. Show uploaded files with filename, type, preview link. Save references to `student_documents`. |
| Fri | **Portfolio builder (basic)** | Form-based: sections for projects, awards, activities, personal statement. Save structure as JSON to `student_portfolios` (source = `sabaiapply`). Generate a simple PDF from it. |

### WEEK 2 — Browse, Apply, Track

| Day | Feature | What to build |
|-----|---------|---------------|
| Mon | **Portfolio import** | Import via URL (TCASFolio link) or upload PDF (iFolio/freestyle). Store as reference in `student_portfolios` with the appropriate `source` field. |
| Tue | **Browse programs page** | List all programs with: university name, faculty, seats, deadline, tuition. Search by name. Filter by university, degree type, deadline. |
| Wed | **Eligibility checker** | When student clicks a program → system reads `program_requirements` and compares against student's GPA, scores, and documents. Show green (meets all) / yellow (borderline) / red (doesn't qualify). |
| Thu | **Application flow** | "Apply" button → auto-fill from profile → show custom questions (from `program_requirements.custom_questions`) → attach portfolio → submit. Block submission if hard requirements not met. Write to `applications`. |
| Fri | **Application tracker** | Dashboard: list all submitted applications with program name, status badge, submission date. Status is read from `applications.status` (kept up to date by Founder B's side). |

---

## Your Scope: Week 3 (Integration & Polish)

These build on top of the Week 1–2 foundation. Do these after the core is solid.

| Day | Feature | What to build |
|-----|---------|---------------|
| Mon | **Student notifications** | Email via Resend: send on application submitted, on status change, on results published. Trigger from API routes or Supabase webhooks. |
| Tue | **Interview slot booking** | After shortlisted: student sees available slots for that program (from `interview_slots`). Pick a slot → update `interview_slots.application_id` and `status = booked`. Send confirmation email. |
| Wed | **Results page** | Student sees per-application result: Accepted / Waitlisted (show position #) / Not Accepted. If accepted, show next steps. Read from `applications.status`. |
| Thu | **Mobile responsiveness** | Audit every student page on mobile. Most Thai students will apply from phones. Fix breakpoints, tap targets, form usability. |
| Fri | **Testing & bug fixes** | Test full student flow end-to-end: register → profile → portfolio → browse → apply → track → interview → result. Fix all bugs. |

---

## Week 4 (Shared with Founder B)

| Day | Who | Task |
|-----|-----|------|
| Mon | BOTH | End-to-end test: create test student → apply → faculty reviews → scores → interview → accept → confirm |
| Tue | BOTH | Seed real data: 3–5 Thai universities with real programs and requirements |
| Wed | **You (A)** | Replace placeholder with real landing page on sabaiapply.com |
| Thu | BOTH | Bug fixes, polish, edge cases |
| Fri | BOTH | **Deploy to production. MVP is LIVE.** |

---

## Complete Student Feature List (MVP)

Everything below is owned by you and must be done before launch:

- [ ] Student registration & login
- [ ] Student profile (personal info, education, scores, documents)
- [ ] Portfolio builder (basic, form-based) + PDF generation
- [ ] Portfolio import (TCASFolio URL / iFolio PDF upload)
- [ ] Browse programs page with search & filter
- [ ] Eligibility checker (green/yellow/red per program)
- [ ] Application flow (auto-fill + custom questions + portfolio attach + submit)
- [ ] Application status tracker
- [ ] Email notifications (submitted, status change, results)
- [ ] Interview slot booking (student side)
- [ ] Results page (accepted / waitlisted / rejected)
- [ ] Mobile responsive (all student pages)

---

## NOT in the MVP (Do Not Build Yet)

These are post-launch features. If you find yourself building any of these during the sprint,
stop and return to the checklist above.

- AI-powered program recommendations
- Student-to-student messaging or community features
- Payment processing (tuition deposits)
- Social login (Google/Facebook OAuth)
- Advanced portfolio templates or visual editor
- Multi-language UI (English/Thai toggle)
- Push notifications (mobile app)
- Alumni or acceptance rate statistics

---

## Key Rules

1. **Never push directly to `main`.** Always go through `dev`.
2. **Never change the database schema alone.** Both founders must agree first.
3. **The `applications` table is shared.** You write to it on apply/submit. Founder B reads and
   updates status. Be careful with concurrent access.
4. **Eligibility logic lives on your side.** You read `program_requirements` and do the
   comparison in the frontend or in a Next.js API route. Do not rely on Founder B for this.
5. **All student file uploads go to Supabase Storage.** Use signed URLs for secure access.
   Never expose raw storage bucket paths publicly.
6. **Maintain Documentation.** All API, Database schemas, and architectural docs are located in the `docs/` directory (e.g., `docs/db/index.md` for schemas, `docs/api/` for endpoints). BEFORE making backend or database changes, READ these docs to ensure consistency. WHENEVER you make changes to the API endpoints, Server Actions, or Database schema, you MUST update the corresponding markdown documentation in the `docs/` folder.
