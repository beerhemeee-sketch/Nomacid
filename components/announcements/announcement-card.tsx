import { Pin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Announcement } from "@/lib/types";

export function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-950">{announcement.title}</h3>
            {announcement.is_pinned ? (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                <Pin className="mr-1 inline h-3 w-3" />
                Онцолсон
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{announcement.content}</p>
        </div>
        <span className="shrink-0 text-xs text-slate-400">
          {formatDate(announcement.created_at)}
        </span>
      </div>
    </Card>
  );
}
