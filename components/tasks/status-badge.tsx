import { Badge } from "@/components/ui/badge";
import { statusLabels } from "@/lib/labels";
import type { TaskStatus } from "@/lib/types";

const styles: Record<TaskStatus, string> = {
  new: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-50 text-blue-700",
  blocked: "bg-red-50 text-red-700",
  done: "bg-emerald-50 text-emerald-700"
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge className={styles[status]}>{statusLabels[status]}</Badge>;
}
