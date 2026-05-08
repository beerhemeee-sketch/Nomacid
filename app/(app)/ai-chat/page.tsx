import { Bot } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AiChatPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Bot className="h-6 w-6" />
        </div>
        <CardHeader>
          <CardTitle>AI Chat</CardTitle>
          <CardDescription>
            Nomadic Workspace-ийн дотоод мэдээллээс асууж хариулт авах хэсэг. Дараагийн шатанд идэвхжинэ.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
