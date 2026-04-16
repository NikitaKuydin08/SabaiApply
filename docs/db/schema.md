# Database Documentation

This document provides a detailed overview of the database schema for the SabaiApply application. The backend is built on **Supabase** (PostgreSQL).

## Overview

The database uses PostgreSQL to define tables, custom types, functions, triggers, and Row Level Security (RLS) policies. It is designed to handle multiple user roles (Students, University Admins, Faculty Admins) and their associated data representations accurately.

## Enum Types

- **`user_role`**: Defines the user types in the system.
  - `'student'`
  - `'uni_admin'`
  - `'faculty_admin'`

## Core Tables

### Authentication & Profiles

Supabase Auth seamlessly integrates with public tables via Postgres triggers.

1. **`profiles`**
   - **Fields**: `id` (UUID), `role` (user_role), `full_name`, `avatar_url`, `created_at`, `updated_at`.
   - **Usage**: General user profile mapped 1:1 with `auth.users`. Handled automatically upon user sign-up via trigger \`handle_new_user()\`.
   - **RLS**: Public read, Users can update their own rows. Admins can update roles.

2. **`student_profiles`**
   - **Fields**: `id` (UUID), `user_id` (UUID, UNIQUE), `prefix`, `first_name`, `last_name`, `first_name_th`, `last_name_th`, `date_of_birth`, `nationality`, `id_type`, `id_number`, `contact_email`, `phone`, `address`, `created_at`, `updated_at`.
   - **Usage**: Student-specific demographic details. Automatically initialized for roles of type `'student'`.

### Student Domain / Application Data

1. **`student_education`**
   - Stores student's current high school, GPAX, curriculum type, and study plan. 

2. **`student_family`**
   - Stores family background, parent info, household income, and guardian details. Includes fields in Thai and English.

3. **`student_scores`** (Standardized Tests)
   - Tracks scores like TGAT, TPAT, A-Level, IELTS, TOEFL, etc. Includes test dates and certificate file URLs/names.

4. **`student_subject_scores`**
   - Specifically records grades per subject.

5. **`student_documents`**
   - Central repository for student uploads like ID cards, transcripts, portfolios. Connects to the Supabase `documents` storage bucket.

6. **`student_portfolios`**
   - Represents a portfolio collection created by a student. Contains an essay and supports "snapshots" for finalized submissions to specific applications.

7. **`portfolio_items` & `portfolio_item_files`**
   - Stores individual achievements, activities, or certificates. Supports specific categories like competitions or language tests with robust file attachment models linked to the portfolio.

### University & Faculty Domain

1. **`universities`**
   - Core entity representing an institution (`name`, `name_th`, `logo_url`, `website`).
   - Managed only by `uni_admin`.

2. **`faculties`**
   - Departments within a university.
   - Associated with `university_id`.

3. **`faculty_admins`**
   - Junction table linking a `profile` (role: faculty_admin) to a `faculty`. Allows scoped access to programs and applications.

### Programs & Admissions

1. **`programs`**
   - Defines a degree program for admission (e.g., Computer Engineering). Includes round dates, seat count, fee, and status.

2. **`program_requirements`**
   - Criteria for applying to a program (e.g., Min GPAX, required subjects).

3. **`applications`**
   - **Fields**: `id`, `student_id`, `program_id`, `status` (`draft`, `submitted`, `under_review`, `interview_invited`, `accepted`, `rejected`), `portfolio_snapshot_id`, `submitted_at`.
   - The central link between students and programs.

4. **`interview_slots`**
   - Manageable interview scheduling system where faculty admins define slots and applicants can be assigned to them.

## Triggers

- **`on_auth_user_created`**: Executes `public.handle_new_user()`. Automatically inserts a row into `profiles` and conditionally into `student_profiles` depending on provided user metadata during signup.
- **`set_updated_at`**: Executes `public.update_updated_at()` across mutable tables to maintain `updated_at` accuracy.

## Row Level Security (RLS)

All tables have RLS enabled to guarantee robust API security direct from the client:

- **Students**: Configured strictly to select/insert/update records matching their own `student_id` (determined via matching `auth.uid()` against `student_profiles`).
- **Faculty & Uni Admins**: Policies allow broad SELECT access across student records, and granular ALL access for programmatic assets scoped to their faculties via `faculty_admins` table.

## Storage Buckets

- **`documents`**: Private, accessible only by the student who uploaded them and faculty admins.
- **`portfolios`**: Private, handled identically to documents.
- **`photos`**: Publicly readable (e.g. for user avatars).
- **`logos`**: Publicly readable (for university imagery), writable only by admins.

## Invites

- **`invites`**: Powers the invite-only admin creation process. Tracks unredeemed tokens, role level, and expiry dates. Anyone can lookup an invite by tokens, but only admins can enforce creation.
