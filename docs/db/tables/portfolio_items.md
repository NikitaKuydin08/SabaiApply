# Table: `portfolio_items`

| Column Name | Schema Definition |
|-------------|-------------------|
| `id` | `UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| `student_id` | `UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE` |
| `portfolio_id` | `UUID NOT NULL REFERENCES student_portfolios(id) ON DELETE CASCADE` |
| `item_type` | `TEXT NOT NULL` |
| `title` | `TEXT NOT NULL` |
| `description` | `TEXT` |
| `organizer` | `TEXT` |
| `start_date` | `DATE` |
| `end_date` | `DATE` |
| `competition_level` | `TEXT` |
| `result` | `TEXT` |
| `test_type` | `TEXT` |
| `test_score` | `NUMERIC(7,2)` |
| `test_total` | `NUMERIC(7,2)` |
| `cefr_level` | `TEXT` |
| `details_json` | `JSONB DEFAULT '{}'` |
| `sort_order` | `INTEGER DEFAULT 0` |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
