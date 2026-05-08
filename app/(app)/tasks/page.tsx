import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  List,
  Plus,
  Search,
  SlidersHorizontal
} from "lucide-react";
import { TaskCard } from "@/components/tasks/task-card";
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
import type { LucideIcon } from "lucide-react";

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
        "id,title,description,status,priority,category,start_date,due_date,sequence_order,created_by,created_at,updated_at,task_assignments(teacher_id,profiles(id,full_name,avatar_url,role,created_at,updated_at))"
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
  const monthBase = params.month ? new Date(`${params.month}-01T00:00:00`) : new Date();
  const selectedDay = params.day || dateKey(new Date());

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
            {admin ? "Бүх ажил" : "Миний ажлууд"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">Жагсаалт эсвэл календарь.</p>
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

      <div className="flex gap-2 overflow-x-auto pb-1 md:hidden">
        <QuickIcon href={buildHref(params, { view, status: undefined })} active={!params.status} label="Бүгд" icon={SlidersHorizontal} />
        <QuickIcon href={buildHref(params, { view, status: "new" })} active={params.status === "new"} label="Шинэ" icon={Circle} />
        <QuickIcon href={buildHref(params, { view, status: "in_progress" })} active={params.status === "in_progress"} label="Явц" icon={Clock3} />
        <QuickIcon href={buildHref(params, { view, status: "blocked" })} active={params.status === "blocked"} label="Гацсан" icon={AlertTriangle} />
        <QuickIcon href={buildHref(params, { view, status: "done" })} active={params.status === "done"} label="Дууссан" icon={CheckCircle2} />
        <QuickIcon href={buildHref(params, { view: view === "list" ? "calendar" : "list" })} active={false} label={view === "list" ? "Календарь" : "Жагсаалт"} icon={view === "list" ? CalendarDays : List} />
      </div>

      <Card className="hidden md:block">
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
          <CardDescription>Төлөв, төрөл, багш, хайлт.</CardDescription>
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

function QuickIcon({
  href,
  active,
  label,
  icon: Icon
}: {
  href: string;
  active: boolean;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <Button asChild size="icon" variant={active ? "default" : "outline"} className="shrink-0" title={label}>
      <Link href={href} aria-label={label}>
        <Icon className="h-4 w-4" />
      </Link>
    </Button>
  );
}

function ListView({ tasks }: { tasks: TaskWithRelations[] }) {
  const groups = groupTasks(tasks);
  const entries = Object.entries(groups).filter(([, items]) => items.length > 0);

  if (!tasks.length) {
    return <EmptyState title="Одоогоор ажил алга." description="Шүүлтүүрээ өөрчлөөд дахин шалгана уу." />;
  }

  return (
    <div className="space-y-6">
      {entries.map(([title, items]) => (
        <section key={title} className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-950 sm:text-lg">{title}</h3>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500 shadow-soft">
              {items.length}
            </span>
          </div>
          <div className="space-y-2">
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
  const previousMonth = monthKey(addMonths(month, -1));
  const nextMonth = monthKey(addMonths(month, 1));

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <Card className="p-3 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <Button asChild variant="outline" size="icon">
            <Link href={buildHref(params, { view: "calendar", month: previousMonth })}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h3 className="text-base font-semibold text-slate-950 sm:text-xl">
            {new Intl.DateTimeFormat("mn-MN", { year: "numeric", month: "long" }).format(month)}
          </h3>
          <Button asChild variant="outline" size="icon">
            <Link href={buildHref(params, { view: "calendar", month: nextMonth })}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400 sm:gap-2 sm:text-xs">
          {["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((day) => {
            const key = dateKey(day);
            const dayTasks = tasks.filter((task) => task.due_date === key);
            const done = dayTasks.filter((task) => task.status === "done").length;
            const unresolved = dayTasks.length - done;
            const inMonth = day.getMonth() === month.getMonth();
            return (
              <Link
                key={key}
                href={buildHref(params, {
                  view: "calendar",
                  month: monthKey(month),
                  day: key
                })}
                className={cn(
                  "min-h-16 rounded-xl border bg-white p-1.5 text-left transition hover:border-indigo-200 hover:bg-indigo-50 sm:min-h-24 sm:rounded-2xl sm:p-2",
                  !inMonth && "opacity-35",
                  selectedDay === key && "border-indigo-400 bg-indigo-50"
                )}
              >
                <p className="text-xs font-medium text-slate-950 sm:text-sm">{day.getDate()}</p>
                {dayTasks.length ? (
                  <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px] sm:text-[11px]">
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
                      {dayTasks.length}
                    </span>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1 py-0.5 font-medium text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      {done}
                    </span>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1 py-0.5 font-medium text-amber-700">
                      <Circle className="h-3 w-3" />
                      {unresolved}
                    </span>
                  </div>
                ) : null}
              </Link>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Сонгосон өдөр</CardTitle>
          <CardDescription>{formatDate(selectedDay)}</CardDescription>
        </CardHeader>
        <div className="mb-4 grid grid-cols-5 gap-2 text-center text-sm">
          <Summary icon={List} value={selectedTasks.length} label="Нийт" />
          <Summary icon={CheckCircle2} value={selectedTasks.filter((task) => task.status === "done").length} label="Дууссан" />
          <Summary icon={Clock3} value={selectedTasks.filter((task) => task.status === "in_progress").length} label="Явц" />
          <Summary icon={AlertTriangle} value={selectedTasks.filter((task) => task.status === "blocked").length} label="Гацсан" />
          <Summary icon={Circle} value={selectedTasks.filter((task) => task.status !== "done").length} label="Үлдсэн" />
        </div>
        <div className="space-y-2">
          {selectedTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          {!selectedTasks.length ? <p className="text-sm text-slate-500">Энэ өдөр ажил алга.</p> : null}
        </div>
      </Card>
    </div>
  );
}

function Summary({
  icon: Icon,
  value,
  label
}: {
  icon: LucideIcon;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-2">
      <Icon className="mx-auto h-4 w-4 text-indigo-500" />
      <p className="mt-1 text-lg font-semibold leading-none text-slate-950">{value}</p>
      <p className="mt-1 hidden text-[11px] text-slate-400 sm:block">{label}</p>
      <span className="sr-only">{label}</span>
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
    "Хэтэрсэн": tasks.filter((task) => task.status !== "done" && isOverdue(task.due_date)),
    "Өнөөдөр": tasks.filter((task) => sameDate(task.due_date, today) && task.status !== "done"),
    "Маргааш": tasks.filter((task) => sameDate(task.due_date, tomorrow) && task.status !== "done"),
    "7 хоног": tasks.filter((task) => {
      if (!task.due_date || task.status === "done") return false;
      const due = new Date(task.due_date);
      return due > tomorrow && due <= weekEnd;
    }),
    "Дууссан": tasks.filter((task) => task.status === "done"),
    "Бусад": tasks.filter((task) => !task.due_date && task.status !== "done")
  };
}

function sameDate(value: string | null, date: Date) {
  return value === dateKey(date);
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

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthKey(date: Date) {
  return dateKey(date).slice(0, 7);
}

function buildHref(params: Params, patch: Partial<Params>) {
  const next = new URLSearchParams();
  const merged = { ...params, ...patch };
  Object.entries(merged).forEach(([key, value]) => {
    if (value) next.set(key, value);
  });
  return `/tasks?${next.toString()}`;
}
