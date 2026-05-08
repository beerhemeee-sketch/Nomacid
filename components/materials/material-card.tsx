import Link from "next/link";
import { ExternalLink, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { materialTypeLabels } from "@/lib/labels";
import type { TaskMaterial } from "@/lib/types";

export function MaterialCard({ material }: { material: TaskMaterial }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-2xl bg-indigo-50 p-2 text-indigo-500">
              <FileText className="h-4 w-4" />
            </div>
            <Badge className="bg-slate-100 text-slate-600">
              {materialTypeLabels[material.material_type]}
            </Badge>
          </div>
          <h3 className="mt-4 font-semibold text-slate-950">{material.title}</h3>
          {material.description ? (
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {material.description}
            </p>
          ) : null}
          {material.tasks?.title ? (
            <p className="mt-3 text-xs text-slate-400">
              Холбоотой ажил: {material.tasks.title}
              {material.tasks.category ? ` · ${material.tasks.category}` : ""}
            </p>
          ) : null}
        </div>
        <Link
          href={material.url}
          target="_blank"
          className="rounded-2xl bg-indigo-50 p-3 text-indigo-600 transition hover:bg-indigo-100"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}
