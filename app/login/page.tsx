import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import { loginAction, signupAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F6FB] px-4 py-10">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-center">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white">
              <BriefcaseBusiness className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-950">Nomadic Workspace</p>
              <p className="text-sm text-slate-500">Дотоод ажлын тайван орчин</p>
            </div>
          </div>
          <h1 className="max-w-xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
            Багш нарын өдөр тутмын ажлыг нэг дор цэгцэлнэ.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-500">
            Ажил, хариуцагч, материал, зарлал, сургалтын холбоосоо нэг самбараас харж
            багийн ойлголцлыг илүү тодорхой болгоно.
          </p>
        </section>
        <Card className="p-7 sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-950">Нэвтрэх</h2>
          <p className="mt-2 text-sm text-slate-500">
            Өөрийн Nomadic бүртгэлээр ажлын самбартаа орно уу.
          </p>
          <form className="mt-8 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Имэйл</span>
              <Input name="email" type="email" placeholder="name@nomadic.mn" required />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Нууц үг</span>
              <Input name="password" type="password" placeholder="••••••••" required />
            </label>
            {params.error ? (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {params.error}
              </p>
            ) : null}
            {params.message ? (
              <p className="rounded-2xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                {params.message}
              </p>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <Button formAction={loginAction}>
                Нэвтрэх
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button formAction={signupAction} variant="outline">
                Бүртгүүлэх
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
