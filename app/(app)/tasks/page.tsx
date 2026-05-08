import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { CategoryBadge } from "@/components/tasks/category-badge";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskStatusBadge } from "@/components/tasks/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getSessionProfile } from "@/lib/auth/session";
import { priorityLabels, statusLabels, taskCategories } from "@/lib/labels";
import { isAdmin } from "@/lib/permissions";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import type { Priority, Profile, TaskStatus, TaskWithRelations } from "@/lib/types";

type Params = {
  status?: TaskStatus;
  priority?: Priority;
  category?: string;
  teacher?: string;
  q?: string;
  view?: "list" | "calendar";
  month?: string;
  day?: string;
};

export default async function TasksPage({
  searchParams
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await getSessionProfile();
  const admin = isAdmin(profile);

  const [{ data }, { data: teachersRaw }] = await Promise.all([
    supabase
      .from("tasks")
      .select(
        "*, task_assignments(teacher_id, profiles(id,full_name,avatar_url,role,created_at,updated_at))"
      )
      .order("sequence_order", { ascending: true })
      .order("due_date", { ascending: true, nullsFirst: false }),
    admin
      ? supabase.from("profiles").select("*").eq("role", "teacher").order("full_name")
      : Promise.resolve({ data: [] })
  ]);

  const teachers = (teachersRaw || []) as Profile[];
  const q = (params.q || "").toLowerCase();
  const tasks = ((data || []) as unknown as TaskWithRelations[]).filter((task) => {
    const teacherIds = task.task_assignments?.map((item) => item.teacher_id) || [];
    return (
      (!params.status || task.status === params.status) &&
      (!params.priority || task.priority === params.priority) &&
      (!params.category || task.category === params.category) &&
      (!params.teacher || teacherIds.includes(params.teacher)) &&
      (!q ||
        task.title.toLowerCase().includes(q) ||
        (task.description || "").toLowerCase().includes(q) ||
        (task.category || "").toLowerCase().includes(q))
    );
  });

  const view = params.view || "list";
  const monthBase = params.month ? new Date(`${params.month}-01`) : new Date();
  const selectedDay = params.day || new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-normal text-slate-950">
            {admin ? "Бүх ажлууд" : "Миний ажлууд"}
          </h2>
          <p className="mt-2 text-slate-500">
            Ажлаа жагсаалтаар эсвэл календарь дээрээс хурдан харна.
          </p>
        </div>
        {admin ? (
          <Button asChild>
            <Link href="/tasks/new">
              <Plus className="h-4 w-4" />
              Үүсгэх
            </Link>
          </Button>
        ) : null}
      </div>

      <Card>
        <div className="mb-5 flex flex-wrap gap-2">
          <Button asChild variant={view === "list" ? "default" : "outline"}>
            <Link href={buildHref(params, { view: "list" })}>Жагсаалт</Link>
          </Button>
          <Button asChild variant={view === "calendar" ? "default" : "outline"}>
            <Link href={buildHref(params, { view: "calendar" })}>Календарь</Link>
          </Button>
        </div>
        <CardHeader>
          <CardTitle>Шүүлтүүр</CardTitle>
          <CardDescription>Төлөв, төрөл, багш, хайлтаар нарийсгана.</CardDescription>
        </CardHeader>
        <form className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <input type="hidden" name="view" value={view} />
          <div className="relative md:col-span-2 xl:col-span-2">
            <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <Input name="q" defaultValue={params.q || ""} className="pl-10" placeholder="Хайх" />
          </div>
          <Select name="status" defaultValue={params.status || ""}>
            <option value="">Бүх төлөв</option>
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
          <Select name="priority" defaultValue={params.priority || ""}>
            <option value="">Бүх зэрэглэл</option>
            {Object.entries(priorityLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
          <Select name="category" defaultValue={params.category || ""}>
            <option value="">Бүх төрөл</option>
            {taskCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
          {admin ? (
            <Select name="teacher" defaultValue={params.teacher || ""}>
              <option value="">Бүх багш</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.full_name || teacher.id}
                </option>
              ))}
            </Select>
          ) : null}
          <Button type="submit" variant="outline">
            Шүүх
          </Button>
        </form>
      </Card>

      {view === "calendar" ? (
        <CalendarView tasks={tasks} month={monthBase} selectedDay={selectedDay} params={params} />
      ) : (
        <ListView tasks={tasks} />
      )}
    </div>
  );
}

function ListView({ tasks }: { tasks: TaskWithRelations[] }) {
  const groups = groupTasks(tasks);
  const entries = Object.entries(groups).filter(([, items]) => items.length > 0);

  if (!tasks.length) {
    return <EmptyState title="Одоогоор ажил алга." description="Шүүлтүүрээ өөрчлөөд дахин шалгана уу." />;
  }

  return (
    <div className="space-y-8">
      {entries.map(([title, items]) => (
        <section key={title} className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function CalendarView({
  tasks,
  month,
  selectedDay,
  params
}: {
  tasks: TaskWithRelations[];
  month: Date;
  selectedDay: string;
  params: Params;
}) {
  const days = calendarDays(month);
  const selectedTasks = tasks.filter((task) => task.due_date === selectedDay);
  const previousMonth = addMonths(month, -1).toISOString().slice(0, 7);
  const nextMonth = addMonths(month, 1).toISOString().slice(0, 7);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card>
        <div className="mb-5 flex items-center justify-between">
          <Button asChild variant="outline" size="icon">
            <Link href={buildHref(params, { view: "calendar", month: previousMonth })}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h3 className="text-xl font-semibold text-slate-950">
            {new Intl.DateTimeFormat("mn-MN", { year: "numeric", month: "long" }).format(month)}
          </h3>
          <Button asChild variant="outline" size="icon">
            <Link href={buildHref(params, { view: "calendar", month: nextMonth })}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-slate-400">
          {["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dateKey = day.toISOString().slice(0, 10);
            const dayTasks = tasks.filter((task) => task.due_date === dateKey);
            const done = dayTasks.filter((task) => task.status === "done").length;
            const unresolved = dayTasks.length - done;
            const inMonth = day.getMonth() === month.getMonth();
            return (
              <Link
                key={dateKey}
                href={buildHref(params, {
                  view: "calendar",
                  month: month.toISOString().slice(0, 7),
                  day: dateKey
                })}
                className={cn(
                  "min-h-24 rounded-2xl border bg-white p-2 text-left transition hover:border-indigo-200 hover:bg-indigo-50",
                  !inMonth && "opacity-40",
                  selectedDay === dateKey && "border-indigo-400 bg-indigo-50"
                )}
              >
                <p className="font-medium text-slate-950">{day.getDate()}</p>
                {dayTasks.length ? (
                  <div className="mt-2 space-y-1 text-[11px]">
                    <p className="text-slate-500">Нийт: {dayTasks.length}</p>
                    <p className="text-emerald-600">Дууссан: {done}</p>
                    <p className="text-amber-600">Үлдсэн: {unresolved}</p>
                  </div>
                ) : null}
              </Link>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Сонгосон өдрийн ажлууд</CardTitle>
          <CardDescription>{formatDate(selectedDay)}</CardDescription>
        </CardHeader>
        <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
          <Summary label="Нийт ажил" value={selectedTasks.length} />
          <Summary label="Дууссан" value={selectedTasks.filter((task) => task.status === "done").length} />
          <Summary label="Хийгдэж байна" value={selectedTasks.filter((task) => task.status === "in_progress").length} />
          <Summary label="Гацсан" value={selectedTasks.filter((task) => task.status === "blocked").length} />
          <Summary label="Шийдэгдээгүй" value={selectedTasks.filter((task) => task.status !== "done").length} />
        </div>
        <div className="space-y-3">
          {selectedTasks.map((task) => (
            <Link key={task.id} href={`/tasks/${task.id}`} className="block rounded-3xl bg-slate-50 p-4">
              <div className="flex flex-wrap gap-2">
                <TaskStatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
                <CategoryBadge category={task.category} />
              </div>
              <p className="mt-3 font-medium text-slate-950">{task.title}</p>
            </Link>
          ))}
          {!selectedTasks.length ? <p className="text-sm text-slate-500">Энэ өдөр ажил алга.</p> : null}
        </div>
      </Card>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function groupTasks(tasks: TaskWithRelations[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);

  return {
    "Хугацаа хэтэрсэн": tasks.filter((task) => task.status !== "done" && isOverdue(task.due_date)),
    "Өнөөдөр": tasks.filter((task) => sameDate(task.due_date, today) && task.status !== "done"),
    "Маргааш": tasks.filter((task) => sameDate(task.due_date, tomorrow) && task.status !== "done"),
    "Энэ 7 хоног": tasks.filter((task) => {
      if (!task.due_date || task.status === "done") return false;
      const due = new Date(task.due_date);
      return due > tomorrow && due <= weekEnd;
    }),
    "Дууссан": tasks.filter((task) => task.status === "done"),
    "Бусад": tasks.filter((task) => !task.due_date && task.status !== "done")
  };
}

function sameDate(value: string | null, date: Date) {
  return value === date.toISOString().slice(0, 10);
}

function calendarDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  const day = (first.getDay() + 6) % 7;
  start.setDate(first.getDate() - day);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function buildHref(params: Params, patch: Partial<Params>) {
  const next = new URLSearchParams();
  const merged = { ...params, ...patch };
  Object.entries(merged).forEach(([key, value]) => {
    if (value) next.set(key, value);
  });
  return `/tasks?${next.toString()}`;
}
