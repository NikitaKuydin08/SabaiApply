# Table: `student_education`

| Column Name | Schema Definition |
|-------------|-------------------|
| `id` | `UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| `student_id` | `UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE` |
| `school_name` | `TEXT NOT NULL` |
| `gpa` | `NUMERIC(4, 2)` |
| `graduation_year` | `INTEGER` |
| `transcript_url` | `TEXT` |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
| `school_province` | `TEXT` |
| `curriculum_type` | `TEXT` |
| `study_plan` | `TEXT` |
| `current_grade_level` | `TEXT` |
