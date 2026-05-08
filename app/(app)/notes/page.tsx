import { Trash2 } from "lucide-react";
import { deleteNoteAction } from "@/lib/actions/notes";
import { getSessionProfile } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Note } from "@/lib/types";

export default async function NotesPage() {
  const { supabase, profile } = await getSessionProfile();
  const { data } = await supabase
    .from("notes")
    .select("*")
    .eq("created_by", profile.id)
    .order("created_at", { ascending: false });
  const notes = (data || []) as Note[];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950 sm:text-3xl">Note</h2>
        <p className="mt-1 text-sm text-slate-500">Voice note, санаа, хувийн тэмдэглэл.</p>
      </div>
      {notes.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {notes.map((note) => (
            <Card key={note.id}>
              <div className="flex items-start justify-between gap-3">
                <CardHeader className="mb-0">
                  <CardTitle>{note.title}</CardTitle>
                  <CardDescription>{note.category} · {note.type}</CardDescription>
                </CardHeader>
                <form action={deleteNoteAction.bind(null, note.id)}>
                  <Button type="submit" size="icon" variant="ghost">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </div>
              {note.content ? <p className="mt-3 text-sm leading-6 text-slate-600">{note.content}</p> : null}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="Одоогоор note алга." description="Доорх floating Note товчоор нэмээрэй." />
      )}
    </div>
  );
}
