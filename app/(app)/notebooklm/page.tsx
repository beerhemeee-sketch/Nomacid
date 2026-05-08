import Link from "next/link";
import { getSessionProfile } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { TrainingResource } from "@/lib/types";

export default async function NotebookLmPage() {
  const { supabase } = await getSessionProfile();
  const { data } = await supabase
    .from("training_resources")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  const resources = (data || []) as TrainingResource[];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950 sm:text-3xl">NotebookLM холбоосууд</h2>
        <p className="mt-1 text-sm text-slate-500">Сургалтын эх сурвалжууд.</p>
      </div>
      {resources.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {resources.map((resource) => (
            <Card key={resource.id}>
              <CardHeader>
                <CardTitle>{resource.title}</CardTitle>
                <CardDescription>{resource.category || "Ерөнхий"}</CardDescription>
              </CardHeader>
              <Button asChild variant="outline">
                <Link href={resource.notebooklm_url} target="_blank">
                  NotebookLM дээр нээх
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="Одоогоор холбоос алга." description="Сургалтын сангаас нэмнэ." />
      )}
    </div>
  );
}
