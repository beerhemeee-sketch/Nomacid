import { Trash2 } from "lucide-react";
import {
  createTeacherGroupAction,
  deleteTeacherGroupAction,
  updateTeacherGroupAction
} from "@/lib/actions/groups";
import { requireAdmin } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Profile, TeacherGroup } from "@/lib/types";

export default async function GroupsPage() {
  const { supabase } = await requireAdmin();
  const [{ data: teachersRaw }, { data: groupsRaw }] = await Promise.all([
    supabase.from("profiles").select("*").eq("role", "teacher").order("full_name"),
    supabase
      .from("teacher_groups")
      .select("*, teacher_group_members(*, profiles(*))")
      .order("name")
  ]);

  const teachers = (teachersRaw || []) as Profile[];
  const groups = (groupsRaw || []) as TeacherGroup[];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950 sm:text-3xl">Багшийн багууд</h2>
        <p className="mt-1 text-sm text-slate-500">Task оноох багууд.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Шинэ баг</CardTitle>
          <CardDescription>Нэр, багш нараа сонгоно.</CardDescription>
        </CardHeader>
        <form action={createTeacherGroupAction} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="name" placeholder="Жишээ: Контент баг" required />
            <Input name="description" placeholder="Тайлбар" />
          </div>
          <TeacherChecks teachers={teachers} selected={new Set()} />
          <Button type="submit">Үүсгэх</Button>
        </form>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((group) => {
          const selected = new Set(group.teacher_group_members?.map((member) => member.teacher_id) || []);
          return (
            <Card key={group.id}>
              <form action={updateTeacherGroupAction.bind(null, group.id)} className="space-y-4">
                <div className="flex items-start gap-2">
                  <div className="grid flex-1 gap-2">
                    <Input name="name" defaultValue={group.name} required />
                    <Input name="description" defaultValue={group.description || ""} />
                  </div>
                  <Button formAction={deleteTeacherGroupAction.bind(null, group.id)} size="icon" variant="ghost">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <TeacherChecks teachers={teachers} selected={selected} />
                <Button type="submit" variant="outline">Хадгалах</Button>
              </form>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function TeacherChecks({ teachers, selected }: { teachers: Profile[]; selected: Set<string> }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {teachers.map((teacher) => (
        <label key={teacher.id} className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <input
            name="teacher_ids"
            value={teacher.id}
            type="checkbox"
            defaultChecked={selected.has(teacher.id)}
            className="h-4 w-4"
          />
          {teacher.full_name || teacher.id}
        </label>
      ))}
    </div>
  );
}
