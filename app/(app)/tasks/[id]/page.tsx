import { notFound } from "next/navigation";
import { CalendarDays, CheckCircle2, MessageSquare, Paperclip, Trash2, Users } from "lucide-react";
import {
  addTaskCommentAction,
  addChecklistItemAction,
  addTaskMaterialAction,
  deleteChecklistItemAction,
  deleteTaskMaterialAction,
  deleteTaskAction,
  toggleChecklistItemAction,
  updateTaskAdminAction,
  updateChecklistItemAction,
  updateTaskStatusAction
} from "@/lib/actions/tasks";
import { getSessionProfile } from "@/lib/auth/session";
import { materialTypeLabels, priorityLabels, statusLabels, taskCategories } from "@/lib/labels";
import { isAdmin } from "@/lib/permissions";
import { cn, formatDate } from "@/lib/utils";
import { MaterialCard } from "@/components/materials/material-card";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { TaskStatusBadge } from "@/components/tasks/status-badge";
import { CategoryBadge } from "@/components/tasks/category-badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Profile, TaskWithRelations, TeacherGroup } from "@/lib/types";
import type { LucideIcon } from "lucide-react";

export default async function TaskDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, profile } = await getSessionProfile();
  const admin = isAdmin(profile);

  const { data } = await supabase
    .from("tasks")
    .select(
      "*, task_assignments(teacher_id, profiles(id,full_name,avatar_url,role,created_at,updated_at)), task_materials(*), task_checklist_items(*), task_comments(*, profiles(full_name,avatar_url))"
    )
    .eq("id", id)
    .single();

  if (!data) notFound();
  const task = data as unknown as TaskWithRelations;

  const [{ data: teachersRaw }, { data: groupsRaw }] = admin
    ? await Promise.all([
        supabase.from("profiles").select("*").eq("role", "teacher").order("full_name"),
        supabase.from("teacher_groups").select("*").order("name")
      ])
    : [{ data: [] }, { data: [] }];

  const teachers = (teachersRaw || []) as Profile[];
  const groups = (groupsRaw || []) as TeacherGroup[];
  const assignedIds = new Set(task.task_assignments?.map((assignment) => assignment.teacher_id) || []);
  const checklist = [...(task.task_checklist_items || [])].sort((a, b) => {
    if (a.position !== b.position) return a.position - b.position;
    return a.created_at.localeCompare(b.created_at);
  });
  const doneCount = checklist.filter((item) => item.is_done).length;
  const assignedTeachers =
    task.task_assignments
      ?.map((assignment) => assignment.profiles?.full_name)
      .filter(Boolean)
      .join(", ") || "Хариуцагчгүй";

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <TaskStatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              <CategoryBadge category={task.category} />
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
              {task.title}
            </h2>
            {task.description ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
                {task.description}
              </p>
            ) : null}
          </div>
          {admin ? (
            <form action={deleteTaskAction.bind(null, task.id)}>
              <Button type="submit" variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
                Устгах
              </Button>
            </form>
          ) : null}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
          <Info icon={Users} label="Хариуцагч" value={assignedTeachers} />
          <Info icon={Paperclip} label="Төрөл" value={task.category || "Бусад"} />
          <Info icon={CalendarDays} label="Эхлэх" value={formatDate(task.start_date)} />
          <Info icon={CalendarDays} label="Дуусах" value={formatDate(task.due_date)} />
          <Info icon={CheckCircle2} label="Алхам" value={`${doneCount}/${checklist.length}`} />
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <section className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>{admin ? "Ажил засах" : "Төлөв"}</CardTitle>
              <CardDescription>{admin ? "Үндсэн мэдээлэл." : "Явцаа шинэчилнэ."}</CardDescription>
            </CardHeader>
            {admin ? (
              <form action={updateTaskAdminAction.bind(null, task.id)} className="space-y-4">
                <Input name="title" defaultValue={task.title} required />
                <Textarea name="description" defaultValue={task.description || ""} rows={4} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Select name="category" defaultValue={task.category || "Бусад"}>
                    {taskCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                  <Select name="status" defaultValue={task.status}>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </Select>
                  <Select name="priority" defaultValue={task.priority}>
                    {Object.entries(priorityLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </Select>
                  <Input name="due_date" type="date" defaultValue={task.due_date || ""} />
                </div>
                <details className="rounded-3xl bg-slate-50 p-4">
                  <summary className="cursor-pointer text-sm font-medium text-slate-700">Нэмэлт</summary>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Input name="start_date" type="date" defaultValue={task.start_date || ""} />
                    <Input name="sequence_order" type="number" defaultValue={task.sequence_order} />
                  </div>
                </details>

                {groups.length ? (
                  <div className="rounded-3xl bg-indigo-50 p-4">
                    <p className="mb-3 text-sm font-medium text-indigo-900">Баг оноох</p>
                    <div className="grid gap-2">
                      {groups.map((group) => (
                        <label key={group.id} className="flex items-center gap-2 text-sm text-indigo-800">
                          <input name="group_ids" value={group.id} type="checkbox" className="h-4 w-4" />
                          {group.name}
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="mb-3 text-sm font-medium text-slate-700">Багш нар</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {teachers.map((teacher) => (
                      <label key={teacher.id} className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                          name="teacher_ids"
                          value={teacher.id}
                          type="checkbox"
                          defaultChecked={assignedIds.has(teacher.id)}
                          className="h-4 w-4"
                        />
                        {teacher.full_name || teacher.id}
                      </label>
                    ))}
                  </div>
                </div>
                <Button type="submit">Хадгалах</Button>
              </form>
            ) : (
              <form action={updateTaskStatusAction.bind(null, task.id)} className="space-y-4">
                <Select name="status" defaultValue={task.status}>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>
                <Button type="submit">Хадгалах</Button>
              </form>
            )}
          </Card>

          {admin ? (
            <Card>
              <CardHeader>
                <CardTitle>Материал нэмэх</CardTitle>
                <CardDescription>Холбоос, файл, эх сурвалж.</CardDescription>
              </CardHeader>
              <form action={addTaskMaterialAction.bind(null, task.id)} className="space-y-3">
                <Input name="title" placeholder="Нэр" required />
                <Input name="url" placeholder="https://..." required />
                <Input name="description" placeholder="Тайлбар" />
                <Select name="material_type" defaultValue="link">
                  {Object.entries(materialTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>
                <Button type="submit">Үүсгэх</Button>
              </form>
            </Card>
          ) : null}
        </section>

        <section className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Хийх алхмууд</CardTitle>
              <CardDescription>{checklist.length ? `${doneCount}/${checklist.length} дууссан` : "Алхам алга."}</CardDescription>
            </CardHeader>
            <div className="space-y-2">
              {checklist.map((item) =>
                admin ? (
                  <form
                    key={item.id}
                    action={updateChecklistItemAction.bind(null, task.id, item.id)}
                    className="flex gap-2 rounded-2xl bg-slate-50 p-3"
                  >
                    <Input name="title" defaultValue={item.title} />
                    <Button type="submit" size="sm" variant="outline">Хадгалах</Button>
                    <Button formAction={deleteChecklistItemAction.bind(null, task.id, item.id)} size="sm" variant="ghost">
                      Устгах
                    </Button>
                  </form>
                ) : (
                  <form
                    key={item.id}
                    action={toggleChecklistItemAction.bind(null, task.id, item.id, item.is_done)}
                    className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"
                  >
                    <button
                      type="submit"
                      className="flex h-5 w-5 items-center justify-center rounded-md border border-indigo-200 bg-white"
                      aria-label="Checklist toggle"
                    >
                      {item.is_done ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : null}
                    </button>
                    <span className={cn("text-sm", item.is_done ? "text-slate-400 line-through" : "text-slate-700")}>
                      {item.title}
                    </span>
                  </form>
                )
              )}
            </div>
            {admin ? (
              <form action={addChecklistItemAction.bind(null, task.id)} className="mt-4 flex gap-2">
                <Input name="title" placeholder="Шинэ алхам" />
                <Button type="submit" variant="outline">Нэмэх</Button>
              </form>
            ) : null}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Материалууд</CardTitle>
            </CardHeader>
            {task.task_materials?.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {task.task_materials.map((material) => (
                  <div key={material.id} className="space-y-2">
                    <MaterialCard material={material} />
                    {admin ? (
                      <form action={deleteTaskMaterialAction.bind(null, task.id, material.id)}>
                        <Button type="submit" variant="ghost" size="sm">
                          Устгах
                        </Button>
                      </form>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Материал алга.</p>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ажлын хэлэлцүүлэг</CardTitle>
              <CardDescription>Асуулт, тодруулга, явц.</CardDescription>
            </CardHeader>
            <div className="space-y-3">
              {task.task_comments?.map((comment) => (
                <div key={comment.id} className="rounded-3xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-950">
                      {comment.profiles?.full_name || "Nomadic хэрэглэгч"}
                    </p>
                    <span className="text-xs text-slate-400">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{comment.content}</p>
                </div>
              ))}
            </div>
            <form action={addTaskCommentAction.bind(null, task.id)} className="mt-5 space-y-3">
              <Textarea name="content" placeholder="Хэлэлцүүлэгт бичих..." required rows={3} />
              <Button type="submit">
                <MessageSquare className="h-4 w-4" />
                Илгээх
              </Button>
            </form>
          </Card>
        </section>
      </div>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <Icon className="mb-2 h-4 w-4 text-indigo-500" />
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
