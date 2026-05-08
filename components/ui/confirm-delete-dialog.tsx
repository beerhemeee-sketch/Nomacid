"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConfirmDeleteDialog({
  label = "Устгах",
  onConfirm
}: {
  label?: string;
  onConfirm: () => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-500">Итгэлтэй байна уу?</span>
        <Button
          size="sm"
          variant="destructive"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            await onConfirm();
            setPending(false);
          }}
        >
          Тийм
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
          Болих
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" variant="outline" onClick={() => setConfirming(true)}>
      <Trash2 className="h-4 w-4" />
      {label}
    </Button>
  );
}
