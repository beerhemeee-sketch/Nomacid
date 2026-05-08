import Link from "next/link";
import { AlertTriangle, Bell, CheckCircle2, Clock3, ListTodo, Plus, Users } from "lucide-react";
import { AnnouncementCard } from "@/components/announcements/announcement-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { TaskCard } from "@/components/tasks/task-card";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getSessionProfile } from "@/lib/auth/session";
import { isAdmin } from "@/lib/permissions";
import { isOverdue } from "@/lib/utils";
import type { Announcement, Notification, TaskWithRelations, TrainingResource } from "@/lib/types";

export default async function DashboardPage() {
  const { supabase, profile } = await getSessionProfile();
  const admin = isAdmin(profile);

  const taskSelect =
    "id,title,description,status,priority,category,start_date,due_date,sequence_order,created_by,created_at,updated_at,task_assignments(teacher_id,profiles(id,full_name,avatar_url,role,created_at,updated_at))";

  const [
    { data: tasksRaw },
    { data: announcementsRaw },
    { data: resourcesRaw },
    { data: notificationsRaw },
    { count: teacherCount }
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select(taskSelect)
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(6),
    supabase
      .from("announcements")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(2),
    supabase
      .from("training_resources")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(2),
    supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(4),
    admin
      ? supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "teacher")
      : Promise.resolve({ count: 0 })
  ]);

  const tasks = (tasksRaw || []) as unknown as TaskWithRelations[];
  const announcements = (announcementsRaw || []) as Announcement[];
  const resources = (resourcesRaw || []) as TrainingResource[];
  const notifications = (notificationsRaw || []) as Notification[];

  const total = tasks.length;
  const inProgress = tasks.filter((task) => task.status === "in_progress").length;
  const blocked = tasks.filter((task) => task.status === "blocked").length;
  const done = tasks.filter((task) => task.status === "done").length;
  const overdue = tasks.filter((task) => task.status !== "done" && isOverdue(task.due_date)).length;
  const unread = notifications.filter((item) => !item.is_read).length;

  return (
    <div className="space-y-5 sm:space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="grid gap-5 p-5 md:grid-cols-[1fr_220px] md:p-8">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              {admin ? "Админ самбар" : "Миний самбар"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
              Сайн байна уу, {profile.full_name || "Nomadic багш"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Өнөөдрийн ажлаа нэг дороос.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/tasks">Ажлууд</Link>
              </Button>
              {admin ? (
                <Button asChild variant="outline">
                  <Link href="/tasks/new">
                    <Plus className="h-4 w-4" />
                    Шинэ ажил
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
          <div className="hidden min-h-36 rounded-[28px] bg-gradient-to-br from-indigo-100 via-blue-50 to-white p-5 md:block">
            <div className="flex h-full flex-col justify-end">
              <p className="text-sm font-medium text-indigo-700">Фокус</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Хэн, юу, хэзээ.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-5 gap-2 sm:gap-4 xl:grid-cols-5">
        <StatCard title={admin ? "Нийт ажил" : "Оноогдсон"} value={total} icon={ListTodo} href="/tasks" />
        <StatCard title="Хийгдэж байна" value={inProgress} icon={Clock3} href="/tasks?status=in_progress" />
        <StatCard title="Гацсан" value={blocked} icon={AlertTriangle} href="/tasks?status=blocked" />
        <StatCard title={admin ? "Дууссан" : "Хэтэрсэн"} value={admin ? done : overdue} icon={CheckCircle2} href={admin ? "/tasks?status=done" : "/tasks"} />
        {admin ? (
          <StatCard title="Багш" value={teacherCount || 0} icon={Users} href="/tasks" />
        ) : (
          <StatCard title="Мэдэгдэл" value={unread} icon={Bell} href="/notifications" />
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Миний ажлууд</h2>
              <p className="mt-1 text-sm text-slate-500">Яаралтай, гацсан, ойрын ажил.</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/tasks">Бүгд</Link>
            </Button>
          </div>
          {tasks.length ? (
            <div className="space-y-2">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <EmptyState title="Одоогоор ажил алга." description="Шинэ ажил оноогдоход энд харагдана." />
          )}
        </section>

        <aside className="space-y-5">
          <section className="space-y-3">
            <CardHeader className="mb-2">
              <CardTitle>Зарлал</CardTitle>
            </CardHeader>
            {announcements.map((announcement) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Сургалтын сан</CardTitle>
              <CardDescription>NotebookLM холбоосууд.</CardDescription>
            </CardHeader>
            <div className="space-y-2">
              {resources.map((resource) => (
                <Link
                  key={resource.id}
                  href="/training"
                  className="block rounded-2xl bg-slate-50 p-3 transition hover:bg-indigo-50"
                >
                  <p className="line-clamp-1 font-medium text-slate-950">{resource.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{resource.category || "Ерөнхий"}</p>
                </Link>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
