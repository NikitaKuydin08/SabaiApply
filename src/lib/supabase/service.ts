import { createClient } from "@supabase/supabase-js";

// Service role client — bypasses RLS entirely
// ONLY use in server actions that have already verified the caller is super_admin
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
