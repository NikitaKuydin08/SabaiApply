# Table: `student_subject_scores`

| Column Name | Schema Definition |
|-------------|-------------------|
| `id` | `UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| `student_id` | `UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE` |
| `score_system` | `TEXT NOT NULL` |
| `subject_name` | `TEXT NOT NULL` |
| `score_value` | `NUMERIC(7,2) NOT NULL` |
| `total_possible` | `NUMERIC(7,2)` |
| `grade` | `TEXT` |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
