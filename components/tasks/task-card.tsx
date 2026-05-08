import Link from "next/link";
import { CalendarDays, CheckCircle2, Circle, Users } from "lucide-react";
import { CategoryBadge } from "@/components/tasks/category-badge";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { TaskStatusBadge } from "@/components/tasks/status-badge";
import { cn, formatDate } from "@/lib/utils";
import type { TaskWithRelations } from "@/lib/types";

export function TaskCard({ task }: { task: TaskWithRelations }) {
  const teachers =
    task.task_assignments
      ?.map((assignment) => assignment.profiles?.full_name)
      .filter(Boolean)
      .join(", ") || "Хариуцагчгүй";
  const DoneIcon = task.status === "done" ? CheckCircle2 : Circle;

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="group block rounded-2xl border border-white/70 bg-white px-3 py-3 shadow-soft transition hover:border-indigo-100 hover:shadow-lg sm:px-4"
    >
      <div className="flex items-start gap-3">
        <DoneIcon
          className={cn(
            "mt-1 h-5 w-5 shrink-0",
            task.status === "done" ? "text-emerald-500" : "text-slate-300"
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <TaskStatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            <CategoryBadge category={task.category} />
          </div>
          <h3 className="mt-2 line-clamp-1 text-sm font-semibold text-slate-950 sm:text-base">
            {task.title}
          </h3>
          {task.description ? (
            <p className="mt-1 line-clamp-1 text-xs leading-5 text-slate-500 sm:text-sm">
              {task.description}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 sm:text-sm">
            <span className="flex min-w-0 items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-indigo-400" />
              {formatDate(task.due_date)}
            </span>
            <span className="flex min-w-0 items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-indigo-400" />
              <span className="line-clamp-1">{teachers}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
