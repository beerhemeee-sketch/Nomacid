import { updateProfileAction } from "@/lib/actions/profile";
import { getSessionProfile } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function ProfileSettingsPage() {
  const { profile } = await getSessionProfile();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-normal text-slate-950">Профайл</h2>
        <p className="mt-2 text-slate-500">Өөрийн нэр болон зурагны холбоосыг шинэчилнэ.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Миний мэдээлэл</CardTitle>
          <CardDescription>
            Энэ нэр ажлын хариуцагч, сэтгэгдэл, профайл дээр харагдана.
          </CardDescription>
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
