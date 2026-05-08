"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { workspaceNavigation } from "@/lib/navigation";

export function Sidebar({ unreadNotifications }: { unreadNotifications: number }) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-72 shrink-0 p-4 lg:block">
      <div className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col rounded-[28px] border border-white/80 bg-white p-5 shadow-soft">
        <Link href="/dashboard" className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-bold text-white">
            N
          </div>
          <div>
            <p className="font-semibold text-slate-950">Nomadic</p>
            <p className="text-xs text-slate-400">Workspace</p>
          </div>
        </Link>
        <nav className="space-y-2">
          {workspaceNavigation.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-700",
                  active && "bg-indigo-50 text-indigo-700"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1">{item.label}</span>
                {"countKey" in item && unreadNotifications > 0 ? (
                  <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                    {unreadNotifications}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-3xl bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-950">Өнөөдрийн фокус</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Ажил, зарлал, материал, сургалтын холбоосоо нэг цонхноос хянаарай.
          </p>
        </div>
      </div>
    </aside>
  );
}
