"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth/session";

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

export async function updateProfileAction(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: value(formData, "full_name") || null,
      avatar_url: value(formData, "avatar_url") || null
    })
    .eq("id", profile.id);

  if (error) throw new Error(error.message);
  revalidatePath("/settings/profile");
}
