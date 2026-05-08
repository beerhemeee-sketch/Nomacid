import type { MaterialType, Priority, TaskStatus } from "@/lib/types";

export const statusLabels: Record<TaskStatus, string> = {
  new: "Шинэ",
  in_progress: "Хийгдэж байна",
  blocked: "Гацсан",
  done: "Дууссан"
};

export const priorityLabels: Record<Priority, string> = {
  low: "Бага",
  normal: "Энгийн",
  high: "Өндөр",
  urgent: "Яаралтай"
};

export const materialTypeLabels: Record<MaterialType, string> = {
  link: "Линк",
  google_drive: "Google Drive",
  pdf: "PDF",
  image: "Зураг",
  video_link: "Видео линк",
  other: "Бусад"
};

export const taskCategories = [
  "10-р төв",
  "Сургалт",
  "Рийл хийх",
  "Контент",
  "Дотоод ажил",
  "Зохион байгуулалт",
  "Сургалтын сан",
  "Бусад"
] as const;

export function categoryLabel(category?: string | null) {
  return category || "Бусад";
}
