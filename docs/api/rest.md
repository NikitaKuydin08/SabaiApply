# API Documentation

## 1. Supabase Client API

For standard data retrieval and modifications, the application uses the `@supabase/supabase-js` client wrapper around PostgREST.

### Authentication

Clients instantiate the Supabase client using helper functions defined in `src/lib/supabase` (e.g., `createClient()` for server and `createBrowserClient()` for clients) which automatically handles JWT injection based on cookies.

```ts
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()
const { data, error } = await supabase.auth.getSession()
```

### Direct Table Access (PostgREST)

Because all core tables enforce Row Level Security (RLS), clients securely query the database directly.

**Example: Fetching an applicant's profile**
```ts
const { data, error } = await supabase
  .from('student_profiles')
  .select('*, student_education(*), student_scores(*)')
  .eq('user_id', currentUser.id)
  .single();
```

All interactions go directly to:
`POST / GET / PATCH / DELETE -> https://[PROJECT_REF].supabase.co/rest/v1/[TABLE_NAME]`

## 2. Next.js Server Actions

For privileged operations (especially for University/Faculty Admins) and tasks requiring external services (like sending emails), Next.js Server Actions are used. These execute securely on the server environment.

### `getAdminProfile()`
- **Location**: `src/app/(uni)/admin/actions.ts`
- **Purpose**: Authenticates whether the requester is legitimately an admin (`role !== 'student'`) and returns the profile details.

### `signOut()`
- **Location**: `src/app/(uni)/admin/actions.ts`
- **Purpose**: Clears cookies, signs out from Supabase Auth, and redirects securely.

### `createAndSendInvite(email, facultyId, origin)`
- **Location**: `src/app/(uni)/admin/team/actions.ts`
- **Purpose**: Checks for pending invites, inserts a new unique token into the `invites` table, securely signs the token, and utilizes external mailers (`src/lib/email.ts`) to dispatch the invitation directly.
- **Returns**: `{ success: true, token, emailSent }` or `{ error: string }`.

### University Management Actions
- **Location**: `src/app/(uni)/admin/university/actions.ts`
- **Purpose**: Handling the insertion, updating, and deletion of Universities and their respective Faculties. Revalidates Next cache paths immediately after (`revalidatePath("/admin/university")`).
  - `createUniversity(formData)`
  - `updateUniversity(id, formData)`
  - `createFaculty(universityId, formData)`
  - `updateFaculty(id, formData)`
  - `deleteFaculty(id)`

## 3. Storage Interactions

Direct uploads using the Supabase Storage API handles all document processing, controlled by Storage RLS Policies.

**Endpoint Overview**:
`POST https://[PROJECT_REF].supabase.co/storage/v1/object/[BUCKET_NAME]/[FILE_PATH]`

- **Buckets**: `documents`, `portfolios`, `photos`, `logos`.
- **Convention**: Students always upload to `bucket_name/[user.id]/...` so RLS automatically scopes security to only their own folders.

## Conclusion

By leveraging Supabase's capabilities (PostgREST + RLS) alongside tailored Next.js Server Actions, SabaiApply maintains an extremely thin, high-performance, and secure "backend" without defining redundant explicit Express/Next.js API Handler routes.
