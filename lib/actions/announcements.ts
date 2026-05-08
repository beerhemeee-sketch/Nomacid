"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSessionProfile, requireAdmin } from "@/lib/auth/session";

const schema = z.object({
  title: z.string().min(2),
  content: z.string().min(2),
  is_pinned: z.boolean()
});

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

export async function createAnnouncementAction(formData: FormData) {
  const { supabase, profile } = await requireAdmin();
  const parsed = schema.parse({
    title: value(formData, "title"),
    content: value(formData, "content"),
    is_pinned: formData.get("is_pinned") === "on"
  });

  const { data, error } = await supabase
    .from("announcements")
    .insert({ ...parsed, created_by: profile.id })
    .select("id,title,content")
    .single();

  if (error || !data) throw new Error(error?.message || "Зарлал үүссэнгүй.");

  const { data: teachers } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "teacher");

  if (teachers?.length) {
    await supabase.from("notifications").insert(
      teachers.map((teacher) => ({
        user_id: teacher.id,
        title: "Шинэ зарлал нийтлэгдлээ",
        body: data.title,
        type: "announcement"
      }))
    );
  }

  revalidatePath("/announcements");
  revalidatePath("/dashboard");
}

export async function deleteAnnouncementAction(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/announcements");
}

export async function updateAnnouncementAction(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = schema.parse({
    title: value(formData, "title"),
    content: value(formData, "content"),
    is_pinned: formData.get("is_pinned") === "on"
  });

  const { error } = await supabase
    .from("announcements")
    .update(parsed)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/announcements");
}

export async function toggleAnnouncementPinAction(id: string, isPinned: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("announcements")
    .update({ is_pinned: !isPinned })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/announcements");
}

export async function markAnnouncementReadAction(id: string) {
  const { supabase, profile } = await getSessionProfile();
  const { error } = await supabase.from("announcement_reads").upsert(
    {
      announcement_id: id,
      user_id: profile.id
    },
    { onConflict: "announcement_id,user_id" }
  );
  if (error) throw new Error(error.message);
  revalidatePath("/announcements");
}
