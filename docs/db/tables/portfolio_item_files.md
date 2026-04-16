# Table: `portfolio_item_files`

| Column Name | Schema Definition |
|-------------|-------------------|
| `id` | `UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| `item_id` | `UUID NOT NULL REFERENCES portfolio_items(id) ON DELETE CASCADE` |
| `file_url` | `TEXT NOT NULL` |
| `file_name` | `TEXT NOT NULL` |
| `file_type` | `TEXT` |
| `file_size` | `INTEGER` |
| `sort_order` | `INTEGER DEFAULT 0` |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
