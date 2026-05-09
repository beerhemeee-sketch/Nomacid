create table if not exists public.meeting_rooms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  room_slug text not null unique,
  starts_at timestamptz,
  ends_at timestamptz,
  is_premium boolean default false,
  price_mnt integer check (price_mnt is null or price_mnt >= 0),
  checkout_url text,
  replay_url text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.meeting_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.meeting_rooms(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(room_id, user_id)
);

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  plan text check (plan in ('free', 'premium')) default 'free',
  status text check (status in ('active', 'trialing', 'past_due', 'cancelled')) default 'active',
  current_period_end timestamptz,
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

drop trigger if exists set_meeting_rooms_updated_at on public.meeting_rooms;
create trigger set_meeting_rooms_updated_at
before update on public.meeting_rooms
for each row execute function public.set_updated_at();

drop trigger if exists set_user_subscriptions_updated_at on public.user_subscriptions;
create trigger set_user_subscriptions_updated_at
before update on public.user_subscriptions
for each row execute function public.set_updated_at();

alter table public.meeting_rooms enable row level security;
alter table public.meeting_participants enable row level security;
alter table public.user_subscriptions enable row level security;

drop policy if exists "meeting_rooms_read_authenticated" on public.meeting_rooms;
create policy "meeting_rooms_read_authenticated" on public.meeting_rooms
for select to authenticated
using (true);

drop policy if exists "meeting_rooms_admin_all" on public.meeting_rooms;
create policy "meeting_rooms_admin_all" on public.meeting_rooms
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "meeting_participants_read_own_or_admin" on public.meeting_participants;
create policy "meeting_participants_read_own_or_admin" on public.meeting_participants
for select to authenticated
using (user_id = auth.uid() or public.current_user_role() = 'admin');

drop policy if exists "meeting_participants_join_own" on public.meeting_participants;
create policy "meeting_participants_join_own" on public.meeting_participants
for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "meeting_participants_update_own" on public.meeting_participants;
create policy "meeting_participants_update_own" on public.meeting_participants
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "user_subscriptions_read_own_or_admin" on public.user_subscriptions;
create policy "user_subscriptions_read_own_or_admin" on public.user_subscriptions
for select to authenticated
using (user_id = auth.uid() or public.current_user_role() = 'admin');

drop policy if exists "user_subscriptions_admin_all" on public.user_subscriptions;
create policy "user_subscriptions_admin_all" on public.user_subscriptions
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

insert into public.meeting_rooms (
  title,
  description,
  room_slug,
  is_premium,
  price_mnt
)
values
  (
    'Daily team huddle',
    'Багийн богино daily уулзалтын үнэгүй өрөө.',
    'daily-team-huddle',
    false,
    null
  ),
  (
    'Premium live class',
    'Төлбөртэй live сургалт, workshop, webinar хийх өрөө.',
    'premium-live-class',
    true,
    49000
  )
on conflict (room_slug) do nothing;

create index if not exists idx_meeting_rooms_starts_at on public.meeting_rooms(starts_at);
create index if not exists idx_meeting_rooms_premium on public.meeting_rooms(is_premium, starts_at);
create index if not exists idx_meeting_participants_room on public.meeting_participants(room_id);
create index if not exists idx_user_subscriptions_user_status on public.user_subscriptions(user_id, status);
