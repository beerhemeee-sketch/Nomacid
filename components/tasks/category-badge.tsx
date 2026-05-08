import { Badge } from "@/components/ui/badge";
import { categoryLabel } from "@/lib/labels";

export function CategoryBadge({ category }: { category?: string | null }) {
  return (
    <Badge className="bg-violet-50 text-violet-700">
      {categoryLabel(category)}
    </Badge>
  );
}
