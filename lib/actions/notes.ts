"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth/session";

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

export async function createNoteAction(formData: FormData) {
  const { supabase, profile } = await getSessionProfile();
  const title = value(formData, "title") || "Шинэ note";
  const destination = value(formData, "destination") || "Note";
  const type = value(formData, "type") === "audio" ? "audio" : "text";

  // TODO: Connect Supabase Storage and upload the MediaRecorder blob.
  // For now the MVP stores the note record and keeps audio_url empty.
  const { error } = await supabase.from("notes").insert({
    title,
    type,
    category: destination,
    is_shared: destination === "Мэдлэгийн сан",
    content:
      value(formData, "content") ||
      (type === "audio" ? "Audio note recorded locally. Storage setup pending." : null),
    audio_url: null,
    created_by: profile.id
  });

  if (error) throw new Error(error.message);
  revalidatePath("/notes");
  revalidatePath("/knowledge");
}

export async function deleteNoteAction(noteId: string) {
  const { supabase } = await getSessionProfile();
  const { error } = await supabase.from("notes").delete().eq("id", noteId);
  if (error) throw new Error(error.message);
  revalidatePath("/notes");
  revalidatePath("/knowledge");
}
