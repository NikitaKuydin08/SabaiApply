# Table: `applications`

| Column Name | Schema Definition |
|-------------|-------------------|
| `id` | `UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| `student_id` | `UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE` |
| `program_id` | `UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE` |
| `round` | `admission_round NOT NULL` |
| `status` | `application_status NOT NULL DEFAULT 'submitted'` |
| `custom_answers` | `JSONB DEFAULT '{}'` |
| `portfolio_id` | `UUID REFERENCES student_portfolios(id) ON DELETE SET NULL` |
| `submitted_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
| `reviewed_by` | `UUID REFERENCES profiles(id) ON DELETE SET NULL` |
| `scores` | `JSONB DEFAULT '{}'` |
| `total_score` | `NUMERIC(7, 2)` |
| `waitlist_position` | `INTEGER` |
| `notes` | `TEXT` |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
