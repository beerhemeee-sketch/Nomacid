"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

export async function loginAction(formData: FormData) {
  const supabase = await createClient();
  const email = value(formData, "email");
  const password = value(formData, "password");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent("Нэвтрэх мэдээлэл буруу байна")}`);
  }

  redirect("/dashboard");
}

export async function signupAction(formData: FormData) {
  const supabase = await createClient();
  const email = value(formData, "email");
  const password = value(formData, "password");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: email.split("@")[0]
      }
    }
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent("Бүртгэл үүсгэж чадсангүй")}`);
  }

  redirect(
    `/login?message=${encodeURIComponent("Бүртгэл үүслээ. Одоо нэвтэрч орно уу")}`
  );
}
