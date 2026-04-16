# Table: `student_profiles`

| Column Name | Schema Definition |
|-------------|-------------------|
| `id` | `UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| `user_id` | `UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE` |
| `first_name` | `TEXT` |
| `last_name` | `TEXT` |
| `first_name_th` | `TEXT` |
| `last_name_th` | `TEXT` |
| `dob` | `DATE` |
| `nationality` | `TEXT` |
| `gender` | `TEXT` |
| `phone` | `TEXT` |
| `line_id` | `TEXT` |
| `address` | `TEXT` |
| `photo_url` | `TEXT` |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
| `prefix` | `TEXT` |
| `id_type` | `TEXT` |
| `id_number` | `TEXT` |
| `contact_email` | `TEXT` |
