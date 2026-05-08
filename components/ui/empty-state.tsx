import { Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";

export function EmptyState({
  title,
  description
}: {
  title: string;
  description?: string;
}) {
  return (
    <Card className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-2xl bg-indigo-50 p-4 text-indigo-500">
        <Inbox className="h-7 w-7" />
      </div>
      <h3 className="font-semibold text-slate-950">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      ) : null}
    </Card>
  );
}
