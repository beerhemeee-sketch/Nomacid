import {
  createTrainingResourceAction,
  deleteTrainingNoteAction,
  deleteTrainingResourceAction,
  saveTrainingNoteAction,
  updateTrainingResourceAction
} from "@/lib/actions/training";
import { getSessionProfile } from "@/lib/auth/session";
import { isAdmin } from "@/lib/permissions";
import { TrainingResourceCard } from "@/components/training/training-resource-card";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TrainingResource } from "@/lib/types";

export default async function TrainingPage() {
  const { supabase, profile } = await getSessionProfile();
  const admin = isAdmin(profile);

  const { data } = await supabase
    .from("training_resources")
    .select("*, teacher_training_notes(*)")
    .order("created_at", { ascending: false });
  const resources = (data || []) as unknown as TrainingResource[];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-normal text-slate-950">Сургалтын сан</h2>
        <p className="mt-2 max-w-3xl text-slate-500">
          Nomadic-ийн дотоод багшийн сургалтын NotebookLM холбоосууд. Энэ нь сурагчийн
          сургалтын систем биш, зөвхөн багийн дотоод мэдлэгийн сан.
        </p>
      </div>

      {admin ? (
        <Card>
          <CardHeader>
            <CardTitle>Шинэ сургалтын ресурс</CardTitle>
            <CardDescription>NotebookLM холбоосыг хадгална, app дотор embed хийхгүй.</CardDescription>
          </CardHeader>
          <form action={createTrainingResourceAction} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input name="title" placeholder="Гарчиг" required />
              <Input name="category" placeholder="Ангилал" />
            </div>
            <Textarea name="description" placeholder="Тайлбар" />
            <Input name="notebooklm_url" placeholder="https://notebooklm.google.com/..." required />
            <Input name="source_description" placeholder="Эх сурвалжийн тайлбар" />
            <label className="flex items-center gap-3 text-sm text-slate-600">
              <input name="is_active" type="checkbox" defaultChecked className="h-4 w-4" />
              Идэвхтэй
            </label>
            <Button type="submit" className="w-fit">
              Үүсгэх
            </Button>
          </form>
        </Card>
      ) : null}

      {resources.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {resources.map((resource) => {
            const note = resource.teacher_training_notes?.find(
              (item) => item.teacher_id === profile.id
            );
            return admin ? (
              <Card key={resource.id}>
                <form action={updateTrainingResourceAction.bind(null, resource.id)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input name="title" defaultValue={resource.title} required />
                    <Input name="category" defaultValue={resource.category || ""} />
                  </div>
                  <Textarea name="description" defaultValue={resource.description || ""} />
                  <Input name="notebooklm_url" defaultValue={resource.notebooklm_url} required />
                  <Input name="source_description" defaultValue={resource.source_description || ""} />
                  <label className="flex items-center gap-3 text-sm text-slate-600">
                    <input
                      name="is_active"
                      type="checkbox"
                      defaultChecked={resource.is_active}
                      className="h-4 w-4"
                    />
                    Идэвхтэй
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" variant="outline">
                      Хадгалах
                    </Button>
                    <Button
                      formAction={deleteTrainingResourceAction.bind(null, resource.id)}
                      variant="destructive"
                    >
                      Устгах
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <TrainingResourceCard key={resource.id} resource={resource}>
                <form action={saveTrainingNoteAction.bind(null, resource.id)} className="space-y-3">
                  <Textarea
                    name="note"
                    defaultValue={note?.note || ""}
                    placeholder="Өөрийн хувийн тэмдэглэл..."
                  />
                  <Button type="submit" variant="outline">
                    Тэмдэглэл хадгалах
                  </Button>
                  {note ? (
                    <Button
                      formAction={deleteTrainingNoteAction.bind(null, note.id)}
                      variant="ghost"
                    >
                      Устгах
                    </Button>
                  ) : null}
                </form>
              </TrainingResourceCard>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Сургалтын ресурс алга" description="Идэвхтэй ресурс нэмэгдэх үед энд харагдана." />
      )}
    </div>
  );
}
