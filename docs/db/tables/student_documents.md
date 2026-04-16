# Table: `student_documents`

| Column Name | Schema Definition |
|-------------|-------------------|
| `id` | `UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| `student_id` | `UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE` |
| `doc_type` | `doc_type NOT NULL` |
| `file_url` | `TEXT NOT NULL` |
| `file_name` | `TEXT NOT NULL` |
| `file_size` | `INTEGER` |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
| `description` | `TEXT` |
| `metadata_json` | `JSONB DEFAULT '{}'` |
