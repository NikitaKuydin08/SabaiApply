# Table: `programs`

| Column Name | Schema Definition |
|-------------|-------------------|
| `id` | `UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| `faculty_id` | `UUID NOT NULL REFERENCES faculties(id) ON DELETE CASCADE` |
| `name` | `TEXT NOT NULL` |
| `name_th` | `TEXT` |
| `degree_type` | `TEXT NOT NULL DEFAULT 'bachelor'` |
| `seats_round_1` | `INTEGER DEFAULT 0` |
| `seats_round_2` | `INTEGER DEFAULT 0` |
| `seats_round_4` | `INTEGER DEFAULT 0` |
| `tuition_per_semester` | `NUMERIC(10, 2)` |
| `description` | `TEXT` |
| `is_international` | `BOOLEAN NOT NULL DEFAULT false` |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
