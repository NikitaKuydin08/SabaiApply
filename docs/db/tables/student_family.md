# Table: `student_family`

| Column Name | Schema Definition |
|-------------|-------------------|
| `id` | `UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| `student_id` | `UUID NOT NULL UNIQUE REFERENCES student_profiles(id) ON DELETE CASCADE` |
| `father_prefix` | `TEXT` |
| `father_first_name` | `TEXT` |
| `father_last_name` | `TEXT` |
| `father_first_name_th` | `TEXT` |
| `father_last_name_th` | `TEXT` |
| `father_occupation` | `TEXT` |
| `father_education_level` | `TEXT` |
| `father_phone` | `TEXT` |
| `mother_prefix` | `TEXT` |
| `mother_first_name` | `TEXT` |
| `mother_last_name` | `TEXT` |
| `mother_first_name_th` | `TEXT` |
| `mother_last_name_th` | `TEXT` |
| `mother_occupation` | `TEXT` |
| `mother_education_level` | `TEXT` |
| `mother_phone` | `TEXT` |
| `has_guardian` | `BOOLEAN NOT NULL DEFAULT false` |
| `guardian_relationship` | `TEXT` |
| `guardian_prefix` | `TEXT` |
| `guardian_first_name` | `TEXT` |
| `guardian_last_name` | `TEXT` |
| `guardian_first_name_th` | `TEXT` |
| `guardian_last_name_th` | `TEXT` |
| `guardian_occupation` | `TEXT` |
| `guardian_education_level` | `TEXT` |
| `guardian_phone` | `TEXT` |
| `household_income` | `TEXT` |
| `number_of_siblings` | `INTEGER DEFAULT 0` |
| `sibling_order` | `INTEGER` |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
