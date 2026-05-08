"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSessionProfile, requireAdmin } from "@/lib/auth/session";
import type { TaskStatus } from "@/lib/types";

const taskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  category: z.string().default("Бусад"),
  status: z.enum(["new", "in_progress", "blocked", "done"]),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
  sequence_order: z.coerce.number().default(0)
});

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

export async function createTaskAction(formData: FormData) {
  const { supabase, profile } = await requireAdmin();
  const parsed = taskSchema.parse({
    title: value(formData, "title"),
    description: value(formData, "description"),
    category: value(formData, "category") || "Бусад",
    status: value(formData, "status") || "new",
    priority: value(formData, "priority") || "normal",
    start_date: value(formData, "start_date") || undefined,
    due_date: value(formData, "due_date") || undefined,
    sequence_order: value(formData, "sequence_order") || 0
  });

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      ...parsed,
      description: parsed.description || null,
      start_date: parsed.start_date || null,
      due_date: parsed.due_date || null,
      created_by: profile.id
    })
    .select("id,title")
    .single();

  if (error || !task) {
    throw new Error(error?.message || "Ажил үүсгэж чадсангүй.");
  }

  const teacherIds = formData
    .getAll("teacher_ids")
    .filter((item): item is string => typeof item === "string" && item.length > 0);

  if (teacherIds.length) {
    await supabase.from("task_assignments").insert(
      teacherIds.map((teacher_id) => ({
        task_id: task.id,
        teacher_id
      }))
    );

    await supabase.from("notifications").insert(
      teacherIds.map((user_id) => ({
        user_id,
        title: "Шинэ ажил оноогдлоо",
        body: task.title,
        type: "task_assigned",
        related_task_id: task.id
      }))
    );
  }

  const materialTitles = formData.getAll("material_title");
  const materialUrls = formData.getAll("material_url");
  const materialDescriptions = formData.getAll("material_description");
  const materialTypes = formData.getAll("material_type");

  const materials = materialTitles
    .map((title, index) => ({
      title: typeof title === "string" ? title.trim() : "",
      url: typeof materialUrls[index] === "string" ? materialUrls[index].trim() : "",
      description:
        typeof materialDescriptions[index] === "string"
          ? materialDescriptions[index].trim()
          : "",
      material_type:
        typeof materialTypes[index] === "string" && materialTypes[index]
          ? materialTypes[index]
          : "link"
    }))
    .filter((material) => material.title && material.url)
    .map((material) => ({
      ...material,
      task_id: task.id,
      description: material.description || null,
      created_by: profile.id
    }));

  if (materials.length) {
    await supabase.from("task_materials").insert(materials);
  }

  revalidatePath("/tasks");
  redirect(`/tasks/${task.id}`);
}

export async function updateTaskStatusAction(taskId: string, formData: FormData) {
  const { supabase } = await getSessionProfile();
  const status = value(formData, "status") as TaskStatus;

  if (!["new", "in_progress", "blocked", "done"].includes(status)) {
    throw new Error("Төлөв буруу байна.");
  }

  const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/tasks");
}

export async function addTaskCommentAction(taskId: string, formData: FormData) {
  const { supabase, profile } = await getSessionProfile();
  const content = value(formData, "content");
  if (!content) return;

  const { error } = await supabase.from("task_comments").insert({
    task_id: taskId,
    author_id: profile.id,
    content
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/tasks/${taskId}`);
}

export async function deleteTaskAction(taskId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
  redirect("/tasks");
}

export async function updateTaskAdminAction(taskId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = taskSchema.parse({
    title: value(formData, "title"),
    description: value(formData, "description"),
    category: value(formData, "category") || "Бусад",
    status: value(formData, "status") || "new",
    priority: value(formData, "priority") || "normal",
    start_date: value(formData, "start_date") || undefined,
    due_date: value(formData, "due_date") || undefined,
    sequence_order: value(formData, "sequence_order") || 0
  });

  const { error } = await supabase
    .from("tasks")
    .update({
      ...parsed,
      description: parsed.description || null,
      start_date: parsed.start_date || null,
      due_date: parsed.due_date || null
    })
    .eq("id", taskId);

  if (error) throw new Error(error.message);

  const teacherIds = formData
    .getAll("teacher_ids")
    .filter((item): item is string => typeof item === "string" && item.length > 0);

  const { data: existingAssignments } = await supabase
    .from("task_assignments")
    .select("teacher_id")
    .eq("task_id", taskId);

  const existingIds = new Set(
    (existingAssignments || []).map((assignment) => assignment.teacher_id as string)
  );
  const nextIds = new Set(teacherIds);
  const toInsert = teacherIds.filter((id) => !existingIds.has(id));
  const toDelete = [...existingIds].filter((id) => !nextIds.has(id));

  if (toDelete.length) {
    await supabase
      .from("task_assignments")
      .delete()
      .eq("task_id", taskId)
      .in("teacher_id", toDelete);
  }

  if (toInsert.length) {
    await supabase.from("task_assignments").insert(
      toInsert.map((teacher_id) => ({
        task_id: taskId,
        teacher_id
      }))
    );
    await supabase.from("notifications").insert(
      toInsert.map((user_id) => ({
        user_id,
        title: "Шинэ ажил оноогдлоо",
        body: parsed.title,
        type: "task_assigned",
        related_task_id: taskId
      }))
    );
  }

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/tasks");
}

export async function addTaskMaterialAction(taskId: string, formData: FormData) {
  const { supabase, profile } = await requireAdmin();
  const title = value(formData, "title");
  const url = value(formData, "url");
  if (!title || !url) return;

  const { error } = await supabase.from("task_materials").insert({
    task_id: taskId,
    title,
    url,
    description: value(formData, "description") || null,
    material_type: value(formData, "material_type") || "link",
    created_by: profile.id
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/materials");
}

export async function deleteTaskMaterialAction(taskId: string, materialId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("task_materials")
    .delete()
    .eq("id", materialId)
    .eq("task_id", taskId);
  if (error) throw new Error(error.message);
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/materials");
}

export async function addChecklistItemAction(taskId: string, formData: FormData) {
  const { supabase, profile } = await requireAdmin();
  const title = value(formData, "title");
  if (!title) return;

  const position = Number(value(formData, "position") || 0);
  const { error } = await supabase.from("task_checklist_items").insert({
    task_id: taskId,
    title,
    position,
    created_by: profile.id
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/tasks/${taskId}`);
}

export async function updateChecklistItemAction(
  taskId: string,
  itemId: string,
  formData: FormData
) {
  const { supabase } = await requireAdmin();
  const title = value(formData, "title");
  if (!title) return;
  const position = Number(value(formData, "position") || 0);
  const { error } = await supabase
    .from("task_checklist_items")
    .update({ title, position })
    .eq("id", itemId)
    .eq("task_id", taskId);
  if (error) throw new Error(error.message);
  revalidatePath(`/tasks/${taskId}`);
}

export async function deleteChecklistItemAction(taskId: string, itemId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("task_checklist_items")
    .delete()
    .eq("id", itemId)
    .eq("task_id", taskId);
  if (error) throw new Error(error.message);
  revalidatePath(`/tasks/${taskId}`);
}

export async function toggleChecklistItemAction(
  taskId: string,
  itemId: string,
  isDone: boolean
) {
  const { supabase } = await getSessionProfile();
  const { error } = await supabase
    .from("task_checklist_items")
    .update({ is_done: !isDone })
    .eq("id", itemId)
    .eq("task_id", taskId);
  if (error) throw new Error(error.message);
  revalidatePath(`/tasks/${taskId}`);
}
