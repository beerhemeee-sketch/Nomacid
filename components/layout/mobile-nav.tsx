"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CheckSquare, Home, NotebookTabs, Video, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Самбар", icon: Home },
  { href: "/tasks", label: "Ажил", icon: CheckSquare },
  { href: "/meetings", label: "Meet", icon: Video },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/notes", label: "Note", icon: NotebookTabs },
  { href: "/notifications", label: "Мэд.", icon: Bell }
];

export function MobileNav({ unreadNotifications }: { unreadNotifications: number }) {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 rounded-[24px] border border-white/80 bg-white/95 p-2 shadow-soft backdrop-blur lg:hidden">
      <div className="grid grid-cols-6 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href)) ||
            (item.href === "/tools" &&
              ["/training", "/knowledge", "/notebooklm"].some((href) =>
                pathname.startsWith(href)
              ));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-medium text-slate-500",
                active && "bg-indigo-50 text-indigo-700"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.href === "/notifications" && unreadNotifications > 0 ? (
                <span className="absolute right-1 top-1 rounded-full bg-indigo-600 px-1.5 text-[10px] text-white">
                  {unreadNotifications}
                </span>
              ) : null}
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
