"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth/session";

export async function markNotificationReadAction(id: string) {
  const { supabase } = await getSessionProfile();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/notifications");
}
