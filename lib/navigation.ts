import {
  Bell,
  Bot,
  CheckSquare,
  FileText,
  LayoutDashboard,
  Megaphone,
  NotebookTabs,
  Settings,
  Video,
  Wrench
} from "lucide-react";

export const workspaceNavigation = [
  { href: "/dashboard", label: "Самбар", icon: LayoutDashboard },
  { href: "/tasks", label: "Ажлууд", icon: CheckSquare },
  { href: "/materials", label: "Материал", icon: FileText },
  { href: "/announcements", label: "Зарлал", icon: Megaphone },
  { href: "/meetings", label: "Meetings", icon: Video },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/notes", label: "Note", icon: NotebookTabs },
  { href: "/ai-chat", label: "AI Chat", icon: Bot },
  { href: "/notifications", label: "Мэдэгдэл", icon: Bell, countKey: "notifications" },
  { href: "/settings/profile", label: "Тохиргоо", icon: Settings }
] as const;

export const toolLinks = [
  { href: "/training", label: "Сургалтын сан", description: "Дотоод сургалтын холбоосууд" },
  { href: "/knowledge", label: "Мэдлэгийн сан", description: "Хуваалцсан note, санаа" },
  { href: "/meetings", label: "Live meetings", description: "Premium video rooms, webinars, and replays" },
  { href: "/notebooklm", label: "NotebookLM холбоосууд", description: "NotebookLM эх сурвалжууд" },
  { href: "/notes", label: "Record archive", description: "Voice note архив" }
] as const;
