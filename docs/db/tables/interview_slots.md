# Table: `interview_slots`

| Column Name | Schema Definition |
|-------------|-------------------|
| `id` | `UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| `program_id` | `UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE` |
| `round` | `admission_round NOT NULL DEFAULT '1'` |
| `datetime` | `TIMESTAMPTZ NOT NULL` |
| `duration_minutes` | `INTEGER NOT NULL DEFAULT 15` |
| `location` | `TEXT` |
| `application_id` | `UUID UNIQUE REFERENCES applications(id) ON DELETE SET NULL` |
| `status` | `interview_slot_status NOT NULL DEFAULT 'available'` |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
