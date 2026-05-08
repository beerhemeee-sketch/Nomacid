import Link from "next/link";
import { CalendarDays, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { TaskStatusBadge } from "@/components/tasks/status-badge";
import { CategoryBadge } from "@/components/tasks/category-badge";
import { formatDate } from "@/lib/utils";
import type { TaskWithRelations } from "@/lib/types";

export function TaskCard({ task }: { task: TaskWithRelations }) {
  const teachers =
    task.task_assignments
      ?.map((assignment) => assignment.profiles?.full_name)
      .filter(Boolean)
      .join(", ") || "Хариуцагч сонгоогүй";

  return (
    <Link href={`/tasks/${task.id}`}>
      <Card className="h-full p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          <TaskStatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          <CategoryBadge category={task.category} />
        </div>
        <h3 className="mt-4 text-base font-semibold leading-6 text-slate-950">
          {task.title}
        </h3>
        {task.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
            {task.description}
          </p>
        ) : null}
        <div className="mt-5 space-y-2 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-indigo-400" />
            {formatDate(task.due_date)}
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-400" />
            <span className="line-clamp-1">{teachers}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
