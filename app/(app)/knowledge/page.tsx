import { getSessionProfile } from "@/lib/auth/session";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Note } from "@/lib/types";

export default async function KnowledgePage() {
  const { supabase } = await getSessionProfile();
  const { data } = await supabase
    .from("notes")
    .select("*")
    .eq("is_shared", true)
    .order("created_at", { ascending: false });
  const notes = (data || []) as Note[];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950 sm:text-3xl">Мэдлэгийн сан</h2>
        <p className="mt-1 text-sm text-slate-500">Хуваалцсан note, санаа.</p>
      </div>
      {notes.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <CardTitle>{note.title}</CardTitle>
                <CardDescription>{note.type}</CardDescription>
              </CardHeader>
              {note.content ? <p className="text-sm leading-6 text-slate-600">{note.content}</p> : null}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="Одоогоор мэдээлэл алга." description="Note-оос Мэдлэгийн сан руу хадгалж болно." />
      )}
    </div>
  );
}
