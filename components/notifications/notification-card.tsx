import { Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Notification } from "@/lib/types";

export function NotificationCard({
  notification,
  action
}: {
  notification: Notification;
  action?: React.ReactNode;
}) {
  return (
    <Card className={notification.is_read ? "p-5 opacity-75" : "p-5"}>
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-500">
          <Bell className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-950">{notification.title}</h3>
            <span className="text-xs text-slate-400">
              {formatDate(notification.created_at)}
            </span>
          </div>
          {notification.body ? (
            <p className="mt-2 text-sm leading-6 text-slate-500">{notification.body}</p>
          ) : null}
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </Card>
  );
}
