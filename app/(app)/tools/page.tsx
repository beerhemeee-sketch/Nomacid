import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toolLinks } from "@/lib/navigation";

export default function ToolsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950 sm:text-3xl">Tools</h2>
        <p className="mt-1 text-sm text-slate-500">Сургалт, мэдлэг, холбоосууд.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {toolLinks.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="transition hover:shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <CardHeader className="mb-0">
                  <CardTitle>{item.label}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <ArrowRight className="h-5 w-5 text-indigo-500" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
