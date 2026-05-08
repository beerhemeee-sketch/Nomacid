import { Badge } from "@/components/ui/badge";
import { priorityLabels } from "@/lib/labels";
import type { Priority } from "@/lib/types";

const styles: Record<Priority, string> = {
  low: "bg-slate-100 text-slate-600",
  normal: "bg-indigo-50 text-indigo-700",
  high: "bg-amber-50 text-amber-700",
  urgent: "bg-red-50 text-red-700"
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge className={styles[priority]}>{priorityLabels[priority]}</Badge>;
}
