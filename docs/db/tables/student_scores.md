# Table: `student_scores`

| Column Name | Schema Definition |
|-------------|-------------------|
| `id` | `UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| `student_id` | `UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE` |
| `score_type` | `score_type NOT NULL` |
| `score_value` | `NUMERIC(7, 2) NOT NULL` |
| `test_date` | `DATE` |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
| `sub_type` | `TEXT` |
| `total_possible` | `NUMERIC(7,2)` |
| `cefr_level` | `TEXT` |
| `certificate_url` | `TEXT` |
| `certificate_file_name` | `TEXT` |
