import Link from "next/link";
import { CalendarClock, Lock, Play, Plus, Radio, Receipt, Video } from "lucide-react";
import {
  createMeetingRoomAction,
  deleteMeetingRoomAction,
  joinMeetingRoomAction,
  updateMeetingRoomAction
} from "@/lib/actions/meetings";
import { getSessionProfile } from "@/lib/auth/session";
import { isAdmin } from "@/lib/permissions";
import type { MeetingRoom } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type MeetingsPageProps = {
  searchParams: Promise<{ room?: string; upgrade?: string }>;
};

function formatDate(value: string | null) {
  if (!value) return "Open room";
  return new Intl.DateTimeFormat("mn-MN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatPrice(value: number | null) {
  if (!value) return "Premium";
  return new Intl.NumberFormat("mn-MN").format(value) + " MNT";
}

function meetingUrl(room: MeetingRoom) {
  return `https://meet.jit.si/${encodeURIComponent(`nomadic-${room.room_slug}`)}`;
}

export default async function MeetingsPage({ searchParams }: MeetingsPageProps) {
  const params = await searchParams;
  const { supabase, profile } = await getSessionProfile();
  const admin = isAdmin(profile);

  const [{ data: rooms }, { data: subscription }] = await Promise.all([
    supabase
      .from("meeting_rooms")
      .select("*")
      .order("starts_at", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("user_subscriptions")
      .select("plan,status,current_period_end")
      .eq("user_id", profile.id)
      .in("status", ["active", "trialing"])
      .maybeSingle()
  ]);

  const meetingRooms = (rooms || []) as MeetingRoom[];
  const hasPremium =
    admin ||
    (subscription?.plan === "premium" &&
      (!subscription.current_period_end ||
        new Date(subscription.current_period_end).getTime() > Date.now()));
  const selectedRoom =
    meetingRooms.find((room) => room.id === params.room) ||
    meetingRooms.find((room) => !room.is_premium || hasPremium) ||
    meetingRooms[0];
  const canViewSelected = selectedRoom ? hasPremium || !selectedRoom.is_premium : false;
  const upgradeRoom = meetingRooms.find((room) => room.is_premium && room.checkout_url);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] bg-slate-950 text-white shadow-soft">
        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_340px] lg:p-6">
          <div className="min-h-[360px] overflow-hidden rounded-2xl bg-slate-900">
            {selectedRoom && canViewSelected ? (
              <iframe
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                className="h-[62vh] min-h-[360px] w-full"
                src={meetingUrl(selectedRoom)}
                title={selectedRoom.title}
              />
            ) : (
              <div className="flex h-[62vh] min-h-[360px] flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                  <Lock className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Premium meeting locked</h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
                    Энэ өрөө төлбөртэй эрхтэй хэрэглэгчдэд нээгдэнэ. Төлбөрийн холбоос
                    нэмэгдсэн бол доороос үргэлжлүүлнэ.
                  </p>
                </div>
                {upgradeRoom?.checkout_url ? (
                  <Button asChild>
                    <Link href={upgradeRoom.checkout_url}>Upgrade access</Link>
                  </Button>
                ) : null}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between gap-5 rounded-2xl bg-white p-5 text-slate-950">
            <div>
              <Badge className="bg-emerald-50 text-emerald-700">
                <Radio className="mr-1 h-3.5 w-3.5" />
                Live meeting
              </Badge>
              <h1 className="mt-4 text-3xl font-semibold tracking-normal">
                {selectedRoom?.title || "Meetings"}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {selectedRoom?.description ||
                  "Видео уулзалт, webinar, paid session-уудыг апп дотроос удирдах хэсэг."}
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Access
                </p>
                <p className="mt-1 font-semibold">
                  {hasPremium ? "Premium enabled" : "Free access"}
                </p>
              </div>
              {selectedRoom?.replay_url ? (
                <Button asChild variant="outline" className="w-full">
                  <Link href={selectedRoom.replay_url}>
                    <Play className="h-4 w-4" />
                    Watch replay
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {params.upgrade ? (
        <Card className="border-indigo-100 bg-indigo-50">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Premium эрх хэрэгтэй байна</CardTitle>
              <CardDescription>
                Checkout/QPay/Stripe холбоосыг admin room дээр нэмэхэд төлбөрийн урсгал шууд
                энэ хэсгээс эхэлнэ.
              </CardDescription>
            </div>
            {upgradeRoom?.checkout_url ? (
              <Button asChild>
                <Link href={upgradeRoom.checkout_url}>
                  <Receipt className="h-4 w-4" />
                  Pay now
                </Link>
              </Button>
            ) : null}
          </div>
        </Card>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Rooms</h2>
              <p className="mt-1 text-sm text-slate-500">
                Үнэгүй болон premium уулзалтууд.
              </p>
            </div>
            <Badge className="bg-white text-slate-600">{meetingRooms.length} rooms</Badge>
          </div>

          {meetingRooms.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {meetingRooms.map((room) => {
                const locked = room.is_premium && !hasPremium;
                return (
                  <Card key={room.id} className="space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle>{room.title}</CardTitle>
                          {room.is_premium ? (
                            <Badge className="bg-amber-50 text-amber-700">
                              {formatPrice(room.price_mnt)}
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-50 text-emerald-700">Free</Badge>
                          )}
                        </div>
                        <CardDescription className="mt-2">
                          {room.description || "No description yet."}
                        </CardDescription>
                      </div>
                      {locked ? (
                        <Lock className="h-5 w-5 text-amber-500" />
                      ) : (
                        <Video className="h-5 w-5 text-indigo-500" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <CalendarClock className="h-4 w-4" />
                      {formatDate(room.starts_at)}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <form action={joinMeetingRoomAction.bind(null, room.id)}>
                        <Button type="submit" variant={locked ? "outline" : "default"}>
                          {locked ? "Unlock" : "Join"}
                        </Button>
                      </form>
                      {room.replay_url ? (
                        <Button asChild variant="ghost">
                          <Link href={room.replay_url}>Replay</Link>
                        </Button>
                      ) : null}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Meeting room алга"
              description="Admin хэрэглэгч эхний live room-оо үүсгэхэд энд харагдана."
            />
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paid access</CardTitle>
              <CardDescription>
                Premium room-ууд subscription-той хэрэглэгчдэд нээгдэнэ. Төлбөр амжилттай
                болсны дараа `user_subscriptions` дээр premium active мөр үүсгэнэ.
              </CardDescription>
            </CardHeader>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <span>Current plan</span>
                <strong className="text-slate-950">{hasPremium ? "Premium" : "Free"}</strong>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <span>Video provider</span>
                <strong className="text-slate-950">Jitsi embed</strong>
              </div>
            </div>
          </Card>

          {admin ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  <Plus className="mr-2 inline h-5 w-5" />
                  New room
                </CardTitle>
                <CardDescription>Admin room үүсгээд premium price, checkout link нэмнэ.</CardDescription>
              </CardHeader>
              <form action={createMeetingRoomAction} className="space-y-3">
                <Input name="title" placeholder="Room title" required />
                <Textarea name="description" placeholder="Description" />
                <Input name="starts_at" type="datetime-local" />
                <Input name="ends_at" type="datetime-local" />
                <label className="flex items-center gap-3 text-sm text-slate-600">
                  <input name="is_premium" type="checkbox" className="h-4 w-4" />
                  Premium room
                </label>
                <Input name="price_mnt" type="number" min="0" placeholder="Price MNT" />
                <Input name="checkout_url" type="url" placeholder="Checkout URL" />
                <Input name="replay_url" type="url" placeholder="Replay URL" />
                <Button type="submit" className="w-full">Create room</Button>
              </form>
            </Card>
          ) : null}
        </aside>
      </section>

      {admin && meetingRooms.length ? (
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-950">Admin edit</h2>
          <div className="grid gap-4 xl:grid-cols-2">
            {meetingRooms.map((room) => (
              <Card key={room.id}>
                <form action={updateMeetingRoomAction.bind(null, room.id)} className="space-y-3">
                  <Input name="title" defaultValue={room.title} required />
                  <Textarea name="description" defaultValue={room.description || ""} />
                  <Input
                    name="starts_at"
                    type="datetime-local"
                    defaultValue={room.starts_at?.slice(0, 16) || ""}
                  />
                  <Input
                    name="ends_at"
                    type="datetime-local"
                    defaultValue={room.ends_at?.slice(0, 16) || ""}
                  />
                  <label className="flex items-center gap-3 text-sm text-slate-600">
                    <input
                      name="is_premium"
                      type="checkbox"
                      defaultChecked={room.is_premium}
                      className="h-4 w-4"
                    />
                    Premium room
                  </label>
                  <Input
                    name="price_mnt"
                    type="number"
                    min="0"
                    defaultValue={room.price_mnt || ""}
                    placeholder="Price MNT"
                  />
                  <Input
                    name="checkout_url"
                    type="url"
                    defaultValue={room.checkout_url || ""}
                    placeholder="Checkout URL"
                  />
                  <Input
                    name="replay_url"
                    type="url"
                    defaultValue={room.replay_url || ""}
                    placeholder="Replay URL"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" variant="outline">Save</Button>
                    <Button
                      formAction={deleteMeetingRoomAction.bind(null, room.id)}
                      variant="destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </form>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
