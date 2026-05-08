import Link from "next/link";
import { BookOpen, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TrainingResource } from "@/lib/types";

export function TrainingResourceCard({
  resource,
  children
}: {
  resource: TrainingResource;
  children?: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-5">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-500">
              <BookOpen className="h-5 w-5" />
            </div>
            {resource.category ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {resource.category}
              </span>
            ) : null}
          </div>
          <h3 className="text-lg font-semibold text-slate-950">{resource.title}</h3>
          {resource.description ? (
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {resource.description}
            </p>
          ) : null}
          {resource.source_description ? (
            <p className="mt-3 text-xs text-slate-400">
              Эх сурвалж: {resource.source_description}
            </p>
          ) : null}
        </div>
        <Button asChild variant="outline">
          <Link href={resource.notebooklm_url} target="_blank">
            NotebookLM дээр нээх
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
        {children}
      </div>
    </Card>
  );
}
