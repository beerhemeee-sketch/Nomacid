create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text check (role in ('admin', 'teacher')) default 'teacher',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text check (status in ('new', 'in_progress', 'blocked', 'done')) default 'new',
  priority text check (priority in ('low', 'normal', 'high', 'urgent')) default 'normal',
  start_date date,
  due_date date,
  sequence_order integer default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.task_assignments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete cascade,
  assigned_at timestamptz default now(),
  unique(task_id, teacher_id)
);

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.task_materials (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade,
  title text not null,
  description text,
  url text not null,
  material_type text check (material_type in ('link', 'google_drive', 'pdf', 'image', 'video_link', 'other')) default 'link',
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  created_by uuid references public.profiles(id),
  is_pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.training_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  notebooklm_url text not null,
  source_description text,
  created_by uuid references public.profiles(id),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.teacher_training_notes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.profiles(id) on delete cascade,
  training_resource_id uuid references public.training_resources(id) on delete cascade,
  note text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(teacher_id, training_resource_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  type text check (type in ('task_assigned', 'task_updated', 'comment_added', 'announcement', 'training_resource')) default 'task_updated',
  is_read boolean default false,
  related_task_id uuid references public.tasks(id),
  created_at timestamptz default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_task_assigned(task_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.task_assignments
    where task_id = task_uuid
      and teacher_id = auth.uid()
  )
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'teacher'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.prevent_teacher_task_protected_updates()
returns trigger
language plpgsql
as $$
begin
  if public.current_user_role() = 'admin' then
    return new;
  end if;

  if new.title is distinct from old.title
    or new.description is distinct from old.description
    or new.priority is distinct from old.priority
    or new.start_date is distinct from old.start_date
    or new.due_date is distinct from old.due_date
    or new.sequence_order is distinct from old.sequence_order
    or new.created_by is distinct from old.created_by
    or new.created_at is distinct from old.created_at then
    raise exception 'Teachers can update only task status';
  end if;

  return new;
end;
$$;

create or replace function public.prevent_notification_protected_updates()
returns trigger
language plpgsql
as $$
begin
  if new.user_id is distinct from old.user_id
    or new.title is distinct from old.title
    or new.body is distinct from old.body
    or new.type is distinct from old.type
    or new.related_task_id is distinct from old.related_task_id
    or new.created_at is distinct from old.created_at then
    raise exception 'Users can update only notification read state';
  end if;

  return new;
end;
$$;

create or replace function public.notify_task_comment_added()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, title, body, type, related_task_id)
  select
    ta.teacher_id,
    'Ажил дээр шинэ сэтгэгдэл нэмэгдлээ',
    left(new.content, 120),
    'comment_added',
    new.task_id
  from public.task_assignments ta
  where ta.task_id = new.task_id
    and ta.teacher_id <> new.author_id;

  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at before update on public.tasks
for each row execute function public.set_updated_at();

drop trigger if exists set_task_comments_updated_at on public.task_comments;
create trigger set_task_comments_updated_at before update on public.task_comments
for each row execute function public.set_updated_at();

drop trigger if exists set_announcements_updated_at on public.announcements;
create trigger set_announcements_updated_at before update on public.announcements
for each row execute function public.set_updated_at();

drop trigger if exists set_training_resources_updated_at on public.training_resources;
create trigger set_training_resources_updated_at before update on public.training_resources
for each row execute function public.set_updated_at();

drop trigger if exists set_teacher_training_notes_updated_at on public.teacher_training_notes;
create trigger set_teacher_training_notes_updated_at before update on public.teacher_training_notes
for each row execute function public.set_updated_at();

drop trigger if exists prevent_teacher_task_protected_updates on public.tasks;
create trigger prevent_teacher_task_protected_updates before update on public.tasks
for each row execute function public.prevent_teacher_task_protected_updates();

drop trigger if exists prevent_notification_protected_updates on public.notifications;
create trigger prevent_notification_protected_updates before update on public.notifications
for each row execute function public.prevent_notification_protected_updates();

drop trigger if exists notify_task_comment_added on public.task_comments;
create trigger notify_task_comment_added after insert on public.task_comments
for each row execute function public.notify_task_comment_added();

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.task_assignments enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_materials enable row level security;
alter table public.announcements enable row level security;
alter table public.training_resources enable row level security;
alter table public.teacher_training_notes enable row level security;
alter table public.notifications enable row level security;

create policy "profiles_read_own_or_admin" on public.profiles
for select to authenticated
using (id = auth.uid() or public.current_user_role() = 'admin');

create policy "profiles_update_own" on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "tasks_admin_all" on public.tasks
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "tasks_teacher_read_assigned" on public.tasks
for select to authenticated
using (public.is_task_assigned(id));

create policy "tasks_teacher_update_status" on public.tasks
for update to authenticated
using (public.is_task_assigned(id))
with check (public.is_task_assigned(id));

create policy "task_assignments_admin_all" on public.task_assignments
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "task_assignments_teacher_read_own" on public.task_assignments
for select to authenticated
using (teacher_id = auth.uid());

create policy "task_comments_read_allowed" on public.task_comments
for select to authenticated
using (public.current_user_role() = 'admin' or public.is_task_assigned(task_id));

create policy "task_comments_insert_allowed" on public.task_comments
for insert to authenticated
with check (
  author_id = auth.uid()
  and (public.current_user_role() = 'admin' or public.is_task_assigned(task_id))
);

create policy "task_comments_update_own_or_admin" on public.task_comments
for update to authenticated
using (author_id = auth.uid() or public.current_user_role() = 'admin')
with check (author_id = auth.uid() or public.current_user_role() = 'admin');

create policy "task_materials_read_allowed" on public.task_materials
for select to authenticated
using (public.current_user_role() = 'admin' or public.is_task_assigned(task_id));

create policy "task_materials_admin_all" on public.task_materials
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "announcements_read_all" on public.announcements
for select to authenticated
using (true);

create policy "announcements_admin_all" on public.announcements
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "training_resources_read_active_or_admin" on public.training_resources
for select to authenticated
using (is_active = true or public.current_user_role() = 'admin');

create policy "training_resources_admin_all" on public.training_resources
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "teacher_training_notes_own_all" on public.teacher_training_notes
for all to authenticated
using (teacher_id = auth.uid())
with check (teacher_id = auth.uid());

create policy "notifications_read_own" on public.notifications
for select to authenticated
using (user_id = auth.uid());

create policy "notifications_update_own" on public.notifications
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "notifications_admin_insert" on public.notifications
for insert to authenticated
with check (public.current_user_role() = 'admin');

create index if not exists idx_task_assignments_teacher on public.task_assignments(teacher_id);
create index if not exists idx_task_assignments_task on public.task_assignments(task_id);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_due_date on public.tasks(due_date);
create index if not exists idx_notifications_user on public.notifications(user_id, is_read);
