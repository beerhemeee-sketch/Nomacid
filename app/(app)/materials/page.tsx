import { Search } from "lucide-react";
import { MaterialCard } from "@/components/materials/material-card";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getSessionProfile } from "@/lib/auth/session";
import { materialTypeLabels, taskCategories } from "@/lib/labels";
import type { MaterialType, TaskMaterial } from "@/lib/types";

export default async function MaterialsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; type?: MaterialType; category?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await getSessionProfile();
  const { data } = await supabase
    .from("task_materials")
    .select("*, tasks(title,category)")
    .order("created_at", { ascending: false });

  const allMaterials = (data || []) as unknown as TaskMaterial[];
  const q = (params.q || "").toLowerCase();
  const materials = allMaterials.filter((material) => {
    const matchesText =
      !q ||
      material.title.toLowerCase().includes(q) ||
      (material.description || "").toLowerCase().includes(q);
    const matchesType = !params.type || material.material_type === params.type;
    const matchesCategory =
      !params.category || material.tasks?.category === params.category;
    return matchesText && matchesType && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-normal text-slate-950">Материалууд</h2>
        <p className="mt-2 text-slate-500">
          Танд харах эрхтэй ажлуудын холбоос, файл, эх сурвалжууд.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Материал хайх</CardTitle>
          <CardDescription>Нэр, тайлбар, төрлөөр шүүнэ.</CardDescription>
        </CardHeader>
        <form className="grid gap-3 lg:grid-cols-[1fr_190px_190px_120px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <Input name="q" defaultValue={params.q || ""} className="pl-10" placeholder="Хайх" />
          </div>
          <Select name="type" defaultValue={params.type || ""}>
            <option value="">Бүх төрөл</option>
            {Object.entries(materialTypeLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
          <Select name="category" defaultValue={params.category || ""}>
            <option value="">Бүх ажлын төрөл</option>
            {taskCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="outline">
            Хайх
          </Button>
        </form>
      </Card>

      {materials.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {materials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      ) : (
        <EmptyState title="Материал олдсонгүй" description="Хайлт эсвэл шүүлтүүрээ өөрчлөөд үзээрэй." />
      )}
    </div>
  );
}
