# Table: `faculties`

| Column Name | Schema Definition |
|-------------|-------------------|
| `id` | `UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| `university_id` | `UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE` |
| `name` | `TEXT NOT NULL` |
| `name_th` | `TEXT` |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
