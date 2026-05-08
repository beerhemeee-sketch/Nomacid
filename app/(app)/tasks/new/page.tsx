import { createTaskAction } from "@/lib/actions/tasks";
import { requireAdmin } from "@/lib/auth/session";
import { TaskCreateForm } from "@/components/tasks/task-create-form";
import type { Profile } from "@/lib/types";

export default async function NewTaskPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "teacher")
    .order("full_name");
  const teachers = (data || []) as Profile[];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-normal text-slate-950">
          Шинэ ажил үүсгэх
        </h2>
        <p className="mt-2 text-slate-500">
          Хийх зүйл, дараалал, хариуцагч, шаардлагатай материалуудыг тодорхой оруулна.
        </p>
      </div>

      <TaskCreateForm teachers={teachers} action={createTaskAction} />
    </div>
  );
}
