import { createTaskAction } from "@/lib/actions/tasks";
import { requireAdmin } from "@/lib/auth/session";
import { TaskCreateForm } from "@/components/tasks/task-create-form";
import type { Profile, TeacherGroup } from "@/lib/types";

export default async function NewTaskPage() {
  const { supabase } = await requireAdmin();
  const [{ data: teachersRaw }, { data: groupsRaw }] = await Promise.all([
    supabase.from("profiles").select("*").eq("role", "teacher").order("full_name"),
    supabase.from("teacher_groups").select("*").order("name")
  ]);

  const teachers = (teachersRaw || []) as Profile[];
  const groups = (groupsRaw || []) as TeacherGroup[];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
          Шинэ ажил
        </h2>
        <p className="mt-1 text-sm text-slate-500">30 секундэд үүсгэх энгийн form.</p>
      </div>

      <TaskCreateForm teachers={teachers} groups={groups} action={createTaskAction} />
    </div>
  );
}
