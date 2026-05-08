import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getSessionProfile() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (error || !profile) {
    redirect("/login");
  }

  return { supabase, user, profile };
}

export async function requireAdmin() {
  const session = await getSessionProfile();
  if (session.profile.role !== "admin") {
    redirect("/dashboard");
  }
  return session;
}
