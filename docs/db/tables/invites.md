# Table: `invites`

| Column Name | Schema Definition |
|-------------|-------------------|
| `id` | `UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| `email` | `TEXT NOT NULL` |
| `role` | `user_role NOT NULL DEFAULT 'faculty_admin'` |
| `faculty_id` | `UUID REFERENCES faculties(id) ON DELETE CASCADE` |
| `invited_by` | `UUID NOT NULL REFERENCES profiles(id)` |
| `token` | `TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex')` |
| `accepted_at` | `TIMESTAMPTZ` |
| `expires_at` | `TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days')` |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
