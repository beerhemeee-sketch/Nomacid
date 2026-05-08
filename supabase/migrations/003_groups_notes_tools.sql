create table if not exists public.teacher_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.teacher_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.teacher_groups(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(group_id, teacher_id)
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text check (type in ('text', 'audio')) default 'text',
  audio_url text,
  content text,
  category text default 'Note',
  is_shared boolean default false,
  created_by uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists set_teacher_groups_updated_at on public.teacher_groups;
create trigger set_teacher_groups_updated_at
before update on public.teacher_groups
for each row execute function public.set_updated_at();

drop trigger if exists set_notes_updated_at on public.notes;
create trigger set_notes_updated_at
before update on public.notes
for each row execute function public.set_updated_at();

alter table public.teacher_groups enable row level security;
alter table public.teacher_group_members enable row level security;
alter table public.notes enable row level security;

drop policy if exists "teacher_groups_admin_all" on public.teacher_groups;
create policy "teacher_groups_admin_all" on public.teacher_groups
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "teacher_groups_read_authenticated" on public.teacher_groups;
create policy "teacher_groups_read_authenticated" on public.teacher_groups
for select to authenticated
using (true);

drop policy if exists "teacher_group_members_admin_all" on public.teacher_group_members;
create policy "teacher_group_members_admin_all" on public.teacher_group_members
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "teacher_group_members_read_authenticated" on public.teacher_group_members;
create policy "teacher_group_members_read_authenticated" on public.teacher_group_members
for select to authenticated
using (true);

drop policy if exists "notes_read_own_or_shared" on public.notes;
create policy "notes_read_own_or_shared" on public.notes
for select to authenticated
using (created_by = auth.uid() or is_shared = true);

drop policy if exists "notes_insert_own" on public.notes;
create policy "notes_insert_own" on public.notes
for insert to authenticated
with check (created_by = auth.uid());

drop policy if exists "notes_update_own" on public.notes;
create policy "notes_update_own" on public.notes
for update to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

drop policy if exists "notes_delete_own" on public.notes;
create policy "notes_delete_own" on public.notes
for delete to authenticated
using (created_by = auth.uid());

insert into public.teacher_groups (name, description)
values
  ('10-р төвийн багш нар', '10-р төвтэй холбоотой өдөр тутмын ажлын баг'),
  ('Хотхоны баг', 'Хотхон дээр ажилладаг баг'),
  ('Сургалтын баг', 'Дотоод сургалт, арга зүй хариуцах баг'),
  ('Контент баг', 'Контент, материал бэлтгэх баг'),
  ('Рийл баг', 'Рийл болон богино видео санаа бэлтгэх баг')
on conflict do nothing;

create index if not exists idx_teacher_group_members_group on public.teacher_group_members(group_id);
create index if not exists idx_teacher_group_members_teacher on public.teacher_group_members(teacher_id);
create index if not exists idx_notes_created_by on public.notes(created_by);
create index if not exists idx_notes_shared on public.notes(is_shared, created_at);
