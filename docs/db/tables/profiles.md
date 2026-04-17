# Table: `profiles`

| Column Name | Schema Definition |
|-------------|-------------------|
| `id` | `UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE` |
| `email` | `TEXT NOT NULL` |
| `role` | `user_role NOT NULL DEFAULT 'student'` |
| `full_name` | `TEXT` |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
