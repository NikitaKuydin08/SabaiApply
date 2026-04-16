# Table: `faculty_admins`

| Column Name | Schema Definition |
|-------------|-------------------|
| `id` | `UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| `user_id` | `UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE` |
| `faculty_id` | `UUID NOT NULL REFERENCES faculties(id) ON DELETE CASCADE` |
| `is_primary` | `BOOLEAN NOT NULL DEFAULT false` |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
