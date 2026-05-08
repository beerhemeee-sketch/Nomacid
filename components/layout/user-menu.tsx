"use client";

import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export function UserMenu({ profile }: { profile: Profile }) {
  const router = useRouter();
  const supabase = createClient();

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium text-slate-950">
          {profile.full_name || "Nomadic багш"}
        </p>
        <p className="text-xs text-slate-400">
          {profile.role === "admin" ? "Админ" : "Багш"}
        </p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <User className="h-5 w-5" />
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Гарах"
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/login");
          router.refresh();
        }}
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
}
