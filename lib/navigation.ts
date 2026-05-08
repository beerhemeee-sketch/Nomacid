import {
  Bell,
  BookOpen,
  CheckSquare,
  FileText,
  LayoutDashboard,
  Megaphone,
  Settings
} from "lucide-react";

export const workspaceNavigation = [
  { href: "/dashboard", label: "Самбар", icon: LayoutDashboard },
  { href: "/tasks", label: "Миний ажлууд", icon: CheckSquare },
  { href: "/materials", label: "Материалууд", icon: FileText },
  { href: "/announcements", label: "Зарлал", icon: Megaphone },
  { href: "/training", label: "Сургалтын сан", icon: BookOpen },
  { href: "/notifications", label: "Мэдэгдэл", icon: Bell, countKey: "notifications" },
  { href: "/settings/profile", label: "Тохиргоо", icon: Settings }
] as const;
