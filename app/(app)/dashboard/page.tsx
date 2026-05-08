import Link from "next/link";
import { AlertTriangle, Bell, CheckCircle2, Clock3, ListTodo, Users } from "lucide-react";
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
    "*, task_assignments(teacher_id, profiles(id,full_name,avatar_url,role,created_at,updated_at))";

  const [{ data: tasksRaw }, { data: announcementsRaw }, { data: resourcesRaw }, { data: notificationsRaw }, { count: teacherCount }] =
    await Promise.all([
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
        .limit(3),
      supabase
        .from("training_resources")
        .select("*")
        .eq(admin ? "is_active" : "is_active", true)
        .order("created_at", { ascending: false })
        .limit(3),
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

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="grid gap-6 p-7 md:grid-cols-[1fr_260px] md:p-8">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              {admin ? "Админ самбар" : "Миний ажлын самбар"}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
              Сайн байна уу, {profile.full_name || "Nomadic багш"}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
              Өнөөдрийн ажлуудаа нэг дороос хараарай.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/tasks">Ажлуудаа харах</Link>
              </Button>
              {admin ? (
                <Button asChild variant="outline">
                  <Link href="/tasks/new">Шинэ ажил үүсгэх</Link>
                </Button>
              ) : null}
            </div>
          </div>
          <div className="relative min-h-44 rounded-[28px] bg-gradient-to-br from-indigo-100 via-blue-50 to-white p-5">
            <div className="absolute right-6 top-6 h-20 w-20 rounded-[28px] bg-white/70" />
            <div className="absolute bottom-6 left-6 h-16 w-28 rounded-[28px] bg-indigo-500/15" />
            <div className="relative flex h-full flex-col justify-end">
              <p className="text-sm font-medium text-indigo-700">Тодорхой дараалал</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Хэн, юу, хэзээ хийх нь илүү ойлгомжтой байна.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title={admin ? "Нийт ажил" : "Оноогдсон ажил"} value={total} icon={ListTodo} />
        <StatCard title="Хийгдэж байна" value={inProgress} icon={Clock3} />
        <StatCard title="Гацсан" value={blocked} icon={AlertTriangle} />
        <StatCard title={admin ? "Дууссан" : "Хугацаа хэтэрсэн"} value={admin ? done : overdue} icon={CheckCircle2} />
        {admin ? (
          <StatCard title="Багшийн тоо" value={teacherCount || 0} icon={Users} />
        ) : (
          <StatCard title="Шинэ мэдэгдэл" value={notifications.filter((item) => !item.is_read).length} icon={Bell} />
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="space-y-4">
          <CardHeader>
            <CardTitle>Миний ажлууд</CardTitle>
            <CardDescription>
              Яаралтай, гацсан, хугацаа дөхсөн ажлуудаа эхэлж шалгаарай.
            </CardDescription>
          </CardHeader>
          {tasks.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <EmptyState title="Одоогоор ажил алга" description="Шинэ ажил оноогдох үед энд харагдана." />
          )}
        </section>

        <aside className="space-y-6">
          <section className="space-y-4">
            <CardHeader>
              <CardTitle>Сүүлийн зарлал</CardTitle>
            </CardHeader>
            {announcements.map((announcement) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Сургалтын сан</CardTitle>
              <CardDescription>
                Их багшийн сургалтын мэдээлэл, NotebookLM холбоосууд.
              </CardDescription>
            </CardHeader>
            <div className="space-y-3">
              {resources.map((resource) => (
                <Link
                  key={resource.id}
                  href="/training"
                  className="block rounded-2xl bg-slate-50 p-4 transition hover:bg-indigo-50"
                >
                  <p className="font-medium text-slate-950">{resource.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{resource.category || "Ерөнхий"}</p>
                </Link>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
