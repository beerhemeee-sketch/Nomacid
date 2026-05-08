import Link from "next/link";
import { updateProfileAction } from "@/lib/actions/profile";
import { getSessionProfile } from "@/lib/auth/session";
import { isAdmin } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function ProfileSettingsPage() {
  const { profile } = await getSessionProfile();
  const admin = isAdmin(profile);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">Профайл</h2>
          <p className="mt-1 text-sm text-slate-500">Нэр, avatar.</p>
        </div>
        {admin ? (
          <Button asChild variant="outline">
            <Link href="/settings/groups">Багууд</Link>
          </Button>
        ) : null}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Миний мэдээлэл</CardTitle>
          <CardDescription>Ажил, comment дээр харагдана.</CardDescription>
        </CardHeader>
        <form action={updateProfileAction} className="space-y-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Бүтэн нэр</span>
            <Input name="full_name" defaultValue={profile.full_name || ""} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Avatar URL</span>
            <Input name="avatar_url" defaultValue={profile.avatar_url || ""} placeholder="https://..." />
          </label>
          <Button type="submit">Хадгалах</Button>
        </form>
      </Card>
    </div>
  );
}
