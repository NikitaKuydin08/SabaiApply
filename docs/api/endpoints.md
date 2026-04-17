# API / Server Actions Endpoints

> **Note**: SabaiApply primarily uses [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) for server-side logic and mutations. Under the hood, these actions execute securely as `POST` requests.

---

## `GET` - `/auth/callback`

Supabase authentication callback endpoint for OAuth and magic links. Validates PKCE codes and exchanges them for session cookies.

### Request URL Query Parameters
```typescript
{
  code: string;  // The auth code from Supabase
  next?: string; // Optional redirect destination
}
```

### Response

`302` **Redirect** (Successful)
Redirects the user directly to their assigned dashboard.

`400` **Redirect with Error**
Code exchange failed. User is typically redirected back to `/auth/error`.

---

## `POST` - `Action: createAndSendInvite`

Generates a secure 2FA/Invitation token for faculty admins and dispatches it via email.

### Request arguments schema
```typescript
{
  email: string;
  facultyId: string | null;
  origin: string; // The website origin base URL (e.g. 'https://sabaiapply.com')
}
```

### Response

`200` **Successful**
```json
{
  "success": true,
  "token": "a1b2c3d4e5f6... (hex string)",
  "emailSent": true
}
```

`400` **Conflict / Bad Request**
```json
{
  "error": "This email already has a pending invite."
}
```

`500` **Internal Server Error** (Partial failure if email bounce occurs)
```json
{
  "success": true,
  "token": "...",
  "emailSent": false,
  "emailError": "Failed to connect to SMTP"
}
```

---

## `POST` - `Action: createUniversity`

Registers a new university into the core database. Restricted to `uni_admin` roles by database RLS.

### Request Payload (FormData)
```typescript
{
  name: string;        // E.g., 'Chulalongkorn University'
  name_th?: string;    // E.g., 'จุฬาลงกรณ์มหาวิทยาลัย'
  website?: string; 
}
```

### Response

`200` **Successful**
```json
{
  "success": true
}
```

`403` **Forbidden** // Admin Privileges missing (Rejected by Supabase RLS policies)
```json
{
  "error": "new row violates row-level security policy for table \"universities\""
}
```

---

## `POST` - `Action: updateUniversity`

Updates the details of an existing university.

### Request arguments schema
```typescript
{
  id: string; // UUID of university
  formData: FormData; // Same payload shape as createUniversity
}
```

### Response

`200` **Successful**
```json
{
  "success": true
}
```

`500` **Internal Error**
```json
{
  "error": "Error updating database sequence"
}
```

---

## `POST` - `Action: createFaculty`

Registers a new faculty/department under a specific university.

### Request arguments schema
```typescript
{
  universityId: string; // The parent university UUID
  formData: {
    name: string;
    name_th?: string;
  }
}
```

### Response

`200` **Successful**
```json
{
  "success": true
}
```
*(Also links the currently authenticated user as the primary admin for this new Faculty automatically).*

`403` **Forbidden** (RLS Failure)
```json
{
  "error": "new row violates row-level security policy for table \"faculties\""
}
```

---

## `POST` - `Action: getAdminProfile`

Retrieves the authenticated profile payload but rigorously verfies if the user is an admin.

### Request
*(No explicit payload, strictly derives context from the `auth-token` HTTP-Only cookie).*

### Response

`200` **Successful**
```json
{
  "id": "228c3f8d-1577-4073-bce7-16dda1c50b87",
  "role": "uni_admin",
  "full_name": "Somchai Admin"
}
```

`401` **Unauthorized** (Or the user is a mere `'student'`)
Returns `null`.

---

## `POST` - `Action: signOut`

Immediately invalidates the local session cookie and ends the Supabase auth session.

### Request
*(No payload context needed)*

### Response

`302` **Redirect** (Successful)
Clears cookies and forces navigation exactly back to `'/admin/login'`.
