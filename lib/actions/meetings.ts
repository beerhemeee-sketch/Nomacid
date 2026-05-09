"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSessionProfile, requireAdmin } from "@/lib/auth/session";

const meetingSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
  is_premium: z.boolean(),
  price_mnt: z.coerce.number().int().min(0).optional(),
  checkout_url: z.string().url().optional().or(z.literal("")),
  replay_url: z.string().url().optional().or(z.literal(""))
});

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

function slugify(input: string) {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `${slug || "room"}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function createMeetingRoomAction(formData: FormData) {
  const { supabase, profile } = await requireAdmin();
  const parsed = meetingSchema.parse({
    title: value(formData, "title"),
    description: value(formData, "description") || undefined,
    starts_at: value(formData, "starts_at") || undefined,
    ends_at: value(formData, "ends_at") || undefined,
    is_premium: formData.get("is_premium") === "on",
    price_mnt: value(formData, "price_mnt") || undefined,
    checkout_url: value(formData, "checkout_url"),
    replay_url: value(formData, "replay_url")
  });

  const { error } = await supabase.from("meeting_rooms").insert({
    title: parsed.title,
    description: parsed.description || null,
    room_slug: slugify(parsed.title),
    starts_at: parsed.starts_at || null,
    ends_at: parsed.ends_at || null,
    is_premium: parsed.is_premium,
    price_mnt: parsed.is_premium ? parsed.price_mnt || null : null,
    checkout_url: parsed.checkout_url || null,
    replay_url: parsed.replay_url || null,
    created_by: profile.id
  });

  if (error) throw new Error(error.message);
  revalidatePath("/meetings");
}

export async function updateMeetingRoomAction(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = meetingSchema.parse({
    title: value(formData, "title"),
    description: value(formData, "description") || undefined,
    starts_at: value(formData, "starts_at") || undefined,
    ends_at: value(formData, "ends_at") || undefined,
    is_premium: formData.get("is_premium") === "on",
    price_mnt: value(formData, "price_mnt") || undefined,
    checkout_url: value(formData, "checkout_url"),
    replay_url: value(formData, "replay_url")
  });

  const { error } = await supabase
    .from("meeting_rooms")
    .update({
      title: parsed.title,
      description: parsed.description || null,
      starts_at: parsed.starts_at || null,
      ends_at: parsed.ends_at || null,
      is_premium: parsed.is_premium,
      price_mnt: parsed.is_premium ? parsed.price_mnt || null : null,
      checkout_url: parsed.checkout_url || null,
      replay_url: parsed.replay_url || null
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/meetings");
}

export async function deleteMeetingRoomAction(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("meeting_rooms").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/meetings");
}

export async function joinMeetingRoomAction(id: string) {
  const { supabase, profile } = await getSessionProfile();
  const { data: room, error } = await supabase
    .from("meeting_rooms")
    .select("id,is_premium")
    .eq("id", id)
    .single<{ id: string; is_premium: boolean }>();

  if (error || !room) throw new Error(error?.message || "Meeting room not found.");

  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("status,plan,current_period_end")
    .eq("user_id", profile.id)
    .in("status", ["active", "trialing"])
    .maybeSingle<{
      status: "active" | "trialing";
      plan: "free" | "premium";
      current_period_end: string | null;
    }>();

  const premiumActive =
    profile.role === "admin" ||
    !room.is_premium ||
    (subscription?.plan === "premium" &&
      (!subscription.current_period_end ||
        new Date(subscription.current_period_end).getTime() > Date.now()));

  if (!premiumActive) {
    redirect("/meetings?upgrade=1");
  }

  await supabase.from("meeting_participants").upsert(
    {
      room_id: room.id,
      user_id: profile.id,
      joined_at: new Date().toISOString()
    },
    { onConflict: "room_id,user_id" }
  );

  redirect(`/meetings?room=${room.id}`);
}
