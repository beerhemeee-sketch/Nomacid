import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { UserMenu } from "@/components/layout/user-menu";
import { VoiceNoteButton } from "@/components/notes/voice-note-button";
import type { Profile } from "@/lib/types";

export async function AppShell({
  profile,
  unreadNotifications,
  children
}: {
  profile: Profile;
  unreadNotifications: number;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F4F6FB]">
      <div className="flex">
        <Sidebar unreadNotifications={unreadNotifications} />
        <main className="min-w-0 flex-1 px-4 pb-32 pt-4 sm:px-6 lg:px-8 lg:pb-10">
          <header className="mb-6 flex items-center justify-between rounded-[24px] border border-white/80 bg-white px-5 py-4 shadow-soft lg:mt-0">
            <div>
              <p className="text-sm text-slate-400">Nomadic Workspace</p>
              <h1 className="text-xl font-semibold text-slate-950">Дотоод ажлын орчин</h1>
            </div>
            <UserMenu profile={profile} />
          </header>
          {children}
        </main>
      </div>
      <VoiceNoteButton />
      <MobileNav unreadNotifications={unreadNotifications} />
    </div>
  );
}
