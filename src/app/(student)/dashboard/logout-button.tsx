"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border border-[#e0e0e0] px-4 py-2 text-sm font-medium text-[#666] hover:bg-[#f5f5f5] transition-colors"
    >
      Log out
    </button>
  );
}
