# Table: `program_requirements`

| Column Name | Schema Definition |
|-------------|-------------------|
| `id` | `UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| `program_id` | `UUID NOT NULL UNIQUE REFERENCES programs(id) ON DELETE CASCADE` |
| `min_gpa` | `NUMERIC(4, 2)` |
| `required_subjects` | `JSONB DEFAULT '[]'` |
| `required_scores` | `JSONB DEFAULT '[]'` |
| `required_documents` | `JSONB DEFAULT '[]'` |
| `custom_questions` | `JSONB DEFAULT '[]'` |
| `scoring_rubric` | `JSONB DEFAULT '[]'` |
| `deadline_round_1` | `DATE` |
| `deadline_round_2` | `DATE` |
| `deadline_round_4` | `DATE` |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
