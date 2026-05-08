import { markNotificationReadAction } from "@/lib/actions/notifications";
import { getSessionProfile } from "@/lib/auth/session";
import { NotificationCard } from "@/components/notifications/notification-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { Notification } from "@/lib/types";

export default async function NotificationsPage() {
  const { supabase } = await getSessionProfile();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });
  const notifications = (data || []) as Notification[];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-normal text-slate-950">Мэдэгдэл</h2>
        <p className="mt-2 text-slate-500">
          Танд оноогдсон ажил, зарлал, сэтгэгдэл, сургалтын шинэчлэл.
        </p>
      </div>
      {notifications.length ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              action={
                notification.is_read ? null : (
                  <form action={markNotificationReadAction.bind(null, notification.id)}>
                    <Button type="submit" variant="outline" size="sm">
                      Уншсан болгох
                    </Button>
                  </form>
                )
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState title="Мэдэгдэл алга" description="Шинэ мэдээлэл ирэх үед энд харагдана." />
      )}
    </div>
  );
}
