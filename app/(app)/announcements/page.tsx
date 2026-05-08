import {
  createAnnouncementAction,
  deleteAnnouncementAction,
  markAnnouncementReadAction,
  toggleAnnouncementPinAction,
  updateAnnouncementAction
} from "@/lib/actions/announcements";
import { getSessionProfile } from "@/lib/auth/session";
import { isAdmin } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Announcement } from "@/lib/types";

export default async function AnnouncementsPage() {
  const { supabase, profile } = await getSessionProfile();
  const admin = isAdmin(profile);
  const { data } = await supabase
    .from("announcements")
    .select("*, announcement_reads(*)")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });
  const announcements = (data || []) as Announcement[];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-normal text-slate-950">Зарлал</h2>
        <p className="mt-2 text-slate-500">
          Багийн чухал мэдээлэл, нийтлэг сануулга, шинэчлэлүүд.
        </p>
      </div>

      {admin ? (
        <Card>
          <CardHeader>
            <CardTitle>Шинэ зарлал</CardTitle>
            <CardDescription>Нийт багш нарт харагдах зарлал үүсгэнэ.</CardDescription>
          </CardHeader>
          <form action={createAnnouncementAction} className="space-y-4">
            <Input name="title" placeholder="Гарчиг" required />
            <Textarea name="content" placeholder="Зарлалын агуулга" required />
            <label className="flex items-center gap-3 text-sm text-slate-600">
              <input name="is_pinned" type="checkbox" className="h-4 w-4" />
              Онцлох зарлал болгох
            </label>
            <Button type="submit">Үүсгэх</Button>
          </form>
        </Card>
      ) : null}

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id}>
            {admin ? (
              <form action={updateAnnouncementAction.bind(null, announcement.id)} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-400">{formatDate(announcement.created_at)}</span>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      formAction={toggleAnnouncementPinAction.bind(
                        null,
                        announcement.id,
                        announcement.is_pinned
                      )}
                      variant="outline"
                      size="sm"
                    >
                      {announcement.is_pinned ? "Онцлох болиулах" : "Онцлох"}
                    </Button>
                    <Button
                      formAction={deleteAnnouncementAction.bind(null, announcement.id)}
                      variant="destructive"
                      size="sm"
                    >
                      Устгах
                    </Button>
                  </div>
                </div>
                <Input name="title" defaultValue={announcement.title} required />
                <Textarea name="content" defaultValue={announcement.content} required />
                <label className="flex items-center gap-3 text-sm text-slate-600">
                  <input
                    name="is_pinned"
                    type="checkbox"
                    defaultChecked={announcement.is_pinned}
                    className="h-4 w-4"
                  />
                  Онцолсон
                </label>
                <Button type="submit" variant="outline">
                  Хадгалах
                </Button>
              </form>
            ) : (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-950">
                    {announcement.title}
                  </h3>
                  <span className="text-xs text-slate-400">{formatDate(announcement.created_at)}</span>
                </div>
                {announcement.is_pinned ? (
                  <span className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                    Онцолсон
                  </span>
                ) : null}
                {!announcement.announcement_reads?.length ? (
                  <span className="ml-2 mt-3 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                    Уншаагүй
                  </span>
                ) : null}
                <p className="mt-4 text-sm leading-7 text-slate-600">{announcement.content}</p>
                {!announcement.announcement_reads?.length ? (
                  <form action={markAnnouncementReadAction.bind(null, announcement.id)} className="mt-4">
                    <Button type="submit" variant="outline" size="sm">
                      Уншсан болгох
                    </Button>
                  </form>
                ) : null}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
