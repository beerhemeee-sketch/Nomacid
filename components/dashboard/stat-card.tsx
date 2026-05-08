import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  helper,
  icon: Icon,
  href
}: {
  title: string;
  value: number | string;
  helper?: string;
  icon: LucideIcon;
  href?: string;
}) {
  const content = (
    <Card
      className={cn(
        "p-2.5 transition hover:shadow-lg sm:p-5",
        href && "cursor-pointer"
      )}
    >
      <div className="flex flex-col items-center justify-center gap-1 text-center sm:flex-row sm:items-start sm:justify-between sm:gap-3 sm:text-left">
        <div className="rounded-2xl bg-indigo-50 p-2 text-indigo-500 sm:order-2 sm:p-3">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0 sm:order-1">
          <p className="hidden text-sm text-slate-500 sm:block">{title}</p>
          <p className="text-xl font-semibold leading-none text-slate-950 sm:mt-2 sm:text-3xl">{value}</p>
          {helper ? <p className="mt-1 hidden text-xs text-slate-400 sm:block">{helper}</p> : null}
          <span className="sr-only">{title}</span>
        </div>
      </div>
    </Card>
  );

  if (!href) return content;
  return (
    <Link href={href} aria-label={title}>
      {content}
    </Link>
  );
}
