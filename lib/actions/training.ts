"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSessionProfile, requireAdmin } from "@/lib/auth/session";

const resourceSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  category: z.string().optional(),
  notebooklm_url: z.string().url(),
  source_description: z.string().optional(),
  is_active: z.boolean()
});

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

export async function createTrainingResourceAction(formData: FormData) {
  const { supabase, profile } = await requireAdmin();
  const parsed = resourceSchema.parse({
    title: value(formData, "title"),
    description: value(formData, "description") || undefined,
    category: value(formData, "category") || undefined,
    notebooklm_url: value(formData, "notebooklm_url"),
    source_description: value(formData, "source_description") || undefined,
    is_active: formData.get("is_active") !== "off"
  });

  const { data, error } = await supabase
    .from("training_resources")
    .insert({
      ...parsed,
      description: parsed.description || null,
      category: parsed.category || null,
      source_description: parsed.source_description || null,
      created_by: profile.id
    })
    .select("id,title,is_active")
    .single();

  if (error || !data) throw new Error(error?.message || "Сургалтын ресурс үүссэнгүй.");

  if (data.is_active) {
    const { data: teachers } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "teacher");

    if (teachers?.length) {
      await supabase.from("notifications").insert(
        teachers.map((teacher) => ({
          user_id: teacher.id,
          title: "Сургалтын санд шинэ ресурс нэмэгдлээ",
          body: data.title,
          type: "training_resource"
        }))
      );
    }
  }

  revalidatePath("/training");
}

export async function saveTrainingNoteAction(resourceId: string, formData: FormData) {
  const { supabase, profile } = await getSessionProfile();
  const note = value(formData, "note");
  if (!note) return;

  const { data: existing } = await supabase
    .from("teacher_training_notes")
    .select("id")
    .eq("teacher_id", profile.id)
    .eq("training_resource_id", resourceId)
    .maybeSingle();

  const query = existing
    ? supabase
        .from("teacher_training_notes")
        .update({ note })
        .eq("id", existing.id)
    : supabase.from("teacher_training_notes").insert({
        teacher_id: profile.id,
        training_resource_id: resourceId,
        note
      });

  const { error } = await query;
  if (error) throw new Error(error.message);
  revalidatePath("/training");
}

export async function deleteTrainingNoteAction(noteId: string) {
  const { supabase } = await getSessionProfile();
  const { error } = await supabase
    .from("teacher_training_notes")
    .delete()
    .eq("id", noteId);
  if (error) throw new Error(error.message);
  revalidatePath("/training");
}

export async function deleteTrainingResourceAction(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("training_resources").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/training");
}

export async function updateTrainingResourceAction(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = resourceSchema.parse({
    title: value(formData, "title"),
    description: value(formData, "description") || undefined,
    category: value(formData, "category") || undefined,
    notebooklm_url: value(formData, "notebooklm_url"),
    source_description: value(formData, "source_description") || undefined,
    is_active: formData.get("is_active") === "on"
  });

  const { error } = await supabase
    .from("training_resources")
    .update({
      ...parsed,
      description: parsed.description || null,
      category: parsed.category || null,
      source_description: parsed.source_description || null
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/training");
}
