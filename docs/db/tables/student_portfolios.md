# Table: `student_portfolios`

| Column Name | Schema Definition |
|-------------|-------------------|
| `id` | `UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| `student_id` | `UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE` |
| `title` | `TEXT NOT NULL` |
| `source` | `portfolio_source NOT NULL DEFAULT 'sabaiapply'` |
| `content_json` | `JSONB DEFAULT '{}'` |
| `external_url` | `TEXT` |
| `pdf_url` | `TEXT` |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
| `is_snapshot` | `BOOLEAN NOT NULL DEFAULT false` |
| `parent_portfolio_id` | `UUID REFERENCES student_portfolios(id) ON DELETE SET NULL` |
| `essay` | `TEXT` |
