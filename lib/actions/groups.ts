"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth/session";

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

export async function createTeacherGroupAction(formData: FormData) {
  const { supabase, profile } = await requireAdmin();
  const name = value(formData, "name");
  if (!name) return;

  const { data: group, error } = await supabase
    .from("teacher_groups")
    .insert({
      name,
      description: value(formData, "description") || null,
      created_by: profile.id
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  await syncGroupMembers(supabase, group.id, formData);
  revalidatePath("/settings/groups");
}

export async function updateTeacherGroupAction(groupId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = value(formData, "name");
  if (!name) return;

  const { error } = await supabase
    .from("teacher_groups")
    .update({
      name,
      description: value(formData, "description") || null
    })
    .eq("id", groupId);

  if (error) throw new Error(error.message);
  await syncGroupMembers(supabase, groupId, formData);
  revalidatePath("/settings/groups");
}

export async function deleteTeacherGroupAction(groupId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("teacher_groups").delete().eq("id", groupId);
  if (error) throw new Error(error.message);
  revalidatePath("/settings/groups");
}

async function syncGroupMembers(supabase: SupabaseClient, groupId: string, formData: FormData) {
  const teacherIds = formData
    .getAll("teacher_ids")
    .filter((item): item is string => typeof item === "string" && item.length > 0);

  await supabase.from("teacher_group_members").delete().eq("group_id", groupId);

  if (teacherIds.length) {
    await supabase.from("teacher_group_members").insert(
      teacherIds.map((teacher_id) => ({
        group_id: groupId,
        teacher_id
      }))
    );
  }
}
