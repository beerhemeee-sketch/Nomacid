import { notFound } from "next/navigation";
import { CalendarDays, ListOrdered, MessageSquare, Paperclip, Users } from "lucide-react";
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
import { formatDate } from "@/lib/utils";
import { MaterialCard } from "@/components/materials/material-card";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { TaskStatusBadge } from "@/components/tasks/status-badge";
import { CategoryBadge } from "@/components/tasks/category-badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { TaskWithRelations } from "@/lib/types";

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
  const { data: teachersRaw } = admin
    ? await supabase.from("profiles").select("*").eq("role", "teacher").order("full_name")
    : { data: [] };
  const teachers = teachersRaw || [];
  const assignedIds = new Set(
    task.task_assignments?.map((assignment) => assignment.teacher_id) || []
  );
  const checklist = [...(task.task_checklist_items || [])].sort(
    (a, b) => a.position - b.position
  );
  const doneCount = checklist.filter((item) => item.is_done).length;
  const assignedTeachers =
    task.task_assignments
      ?.map((assignment) => assignment.profiles?.full_name)
      .filter(Boolean)
      .join(", ") || "Хариуцагч сонгоогүй";

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <TaskStatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              <CategoryBadge category={task.category} />
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950">
              {task.title}
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-500">
              {task.description || "Тайлбар оруулаагүй байна."}
            </p>
          </div>
          {admin ? (
            <form action={deleteTaskAction.bind(null, task.id)}>
              <Button type="submit" variant="destructive">
                Устгах
              </Button>
            </form>
          ) : null}
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Info icon={Users} label="Хариуцагч" value={assignedTeachers} />
          <Info icon={Paperclip} label="Ажлын төрөл" value={task.category || "Бусад"} />
          <Info icon={ListOrdered} label="Дараалал" value={String(task.sequence_order)} />
          <Info icon={CalendarDays} label="Эхлэх" value={formatDate(task.start_date)} />
          <Info icon={CalendarDays} label="Дуусах" value={formatDate(task.due_date)} />
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <section className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{admin ? "Ажил засах" : "Төлөв шинэчлэх"}</CardTitle>
              <CardDescription>Одоогийн явцаа багтаа ойлгомжтой болгоно.</CardDescription>
            </CardHeader>
            {admin ? (
              <form action={updateTaskAdminAction.bind(null, task.id)} className="space-y-4">
                <Input name="title" defaultValue={task.title} required />
                <Textarea name="description" defaultValue={task.description || ""} />
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
                  <Input name="start_date" type="date" defaultValue={task.start_date || ""} />
                  <Input name="due_date" type="date" defaultValue={task.due_date || ""} />
                  <Input name="sequence_order" type="number" defaultValue={task.sequence_order} />
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="mb-3 text-sm font-medium text-slate-700">Хариуцагчид</p>
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
                <CardDescription>Ажилтай холбоотой файл, холбоос, эх сурвалж.</CardDescription>
              </CardHeader>
              <form action={addTaskMaterialAction.bind(null, task.id)} className="space-y-3">
                <Input name="title" placeholder="Материалын нэр" required />
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

        <section className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Хийх алхмууд</CardTitle>
              <CardDescription>
                {checklist.length
                  ? `${doneCount}/${checklist.length} дууссан`
                  : "Алхам нэмэгдээгүй байна."}
              </CardDescription>
            </CardHeader>
            <div className="space-y-3">
              {checklist.map((item) =>
                admin ? (
                  <form
                    key={item.id}
                    action={updateChecklistItemAction.bind(null, task.id, item.id)}
                    className="grid gap-2 rounded-3xl bg-slate-50 p-3 sm:grid-cols-[1fr_90px_auto]"
                  >
                    <Input name="title" defaultValue={item.title} />
                    <Input name="position" type="number" defaultValue={item.position} />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" variant="outline">
                        Хадгалах
                      </Button>
                      <Button
                        formAction={deleteChecklistItemAction.bind(null, task.id, item.id)}
                        size="sm"
                        variant="ghost"
                      >
                        Устгах
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form
                    key={item.id}
                    action={toggleChecklistItemAction.bind(null, task.id, item.id, item.is_done)}
                    className="flex items-center gap-3 rounded-3xl bg-slate-50 p-4"
                  >
                    <button
                      type="submit"
                      className="flex h-5 w-5 items-center justify-center rounded-md border border-indigo-200 bg-white"
                      aria-label="Checklist toggle"
                    >
                      {item.is_done ? "✓" : ""}
                    </button>
                    <span className={item.is_done ? "text-sm text-slate-400 line-through" : "text-sm text-slate-700"}>
                      {item.title}
                    </span>
                  </form>
                )
              )}
            </div>
            {admin ? (
              <form action={addChecklistItemAction.bind(null, task.id)} className="mt-4 grid gap-2 sm:grid-cols-[1fr_100px_auto]">
                <Input name="title" placeholder="Шинэ алхам" />
                <Input name="position" type="number" defaultValue={checklist.length + 1} />
                <Button type="submit" variant="outline">
                  Үүсгэх
                </Button>
              </form>
            ) : null}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Материалууд</CardTitle>
              <CardDescription>Энэ ажлыг хийхэд хэрэгтэй холбоосууд.</CardDescription>
            </CardHeader>
            {task.task_materials?.length ? (
              <div className="grid gap-4 md:grid-cols-2">
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
              <p className="text-sm text-slate-500">Материал нэмэгдээгүй байна.</p>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Сэтгэгдэл</CardTitle>
              <CardDescription>Асуулт, тодруулга, явцын тэмдэглэл.</CardDescription>
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
              <Textarea name="content" placeholder="Сэтгэгдэл бичих..." required />
              <Button type="submit">
                <MessageSquare className="h-4 w-4" />
                Хадгалах
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
  icon: typeof Paperclip;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl bg-slate-50 p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-indigo-500">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
