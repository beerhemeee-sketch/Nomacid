import { AppShell } from "@/components/layout/app-shell";
import { getSessionProfile } from "@/lib/auth/session";

export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { supabase, profile } = await getSessionProfile();
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false);

  return (
    <AppShell profile={profile} unreadNotifications={count || 0}>
      {children}
    </AppShell>
  );
}
