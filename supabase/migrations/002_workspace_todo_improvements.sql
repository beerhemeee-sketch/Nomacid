alter table public.tasks
add column if not exists category text default 'Бусад';

update public.tasks
set category = 'Бусад'
where category is null;

create table if not exists public.task_checklist_items (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade,
  title text not null,
  is_done boolean default false,
  position integer default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.announcement_reads (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid references public.announcements(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  read_at timestamptz default now(),
  unique(announcement_id, user_id)
);

create or replace function public.prevent_teacher_checklist_protected_updates()
returns trigger
language plpgsql
as $$
begin
  if public.current_user_role() = 'admin' then
    return new;
  end if;

  if new.title is distinct from old.title
    or new.position is distinct from old.position
    or new.task_id is distinct from old.task_id
    or new.created_by is distinct from old.created_by
    or new.created_at is distinct from old.created_at then
    raise exception 'Teachers can update only checklist done state';
  end if;

  return new;
end;
$$;

drop trigger if exists set_task_checklist_items_updated_at on public.task_checklist_items;
create trigger set_task_checklist_items_updated_at before update on public.task_checklist_items
for each row execute function public.set_updated_at();

drop trigger if exists prevent_teacher_checklist_protected_updates on public.task_checklist_items;
create trigger prevent_teacher_checklist_protected_updates before update on public.task_checklist_items
for each row execute function public.prevent_teacher_checklist_protected_updates();

alter table public.task_checklist_items enable row level security;
alter table public.announcement_reads enable row level security;

drop policy if exists "task_checklist_items_read_allowed" on public.task_checklist_items;
create policy "task_checklist_items_read_allowed" on public.task_checklist_items
for select to authenticated
using (public.current_user_role() = 'admin' or public.is_task_assigned(task_id));

drop policy if exists "task_checklist_items_admin_insert" on public.task_checklist_items;
create policy "task_checklist_items_admin_insert" on public.task_checklist_items
for insert to authenticated
with check (public.current_user_role() = 'admin');

drop policy if exists "task_checklist_items_admin_update" on public.task_checklist_items;
create policy "task_checklist_items_admin_update" on public.task_checklist_items
for update to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "task_checklist_items_teacher_toggle" on public.task_checklist_items;
create policy "task_checklist_items_teacher_toggle" on public.task_checklist_items
for update to authenticated
using (public.is_task_assigned(task_id))
with check (public.is_task_assigned(task_id));

drop policy if exists "task_checklist_items_admin_delete" on public.task_checklist_items;
create policy "task_checklist_items_admin_delete" on public.task_checklist_items
for delete to authenticated
using (public.current_user_role() = 'admin');

drop policy if exists "announcement_reads_own_all" on public.announcement_reads;
create policy "announcement_reads_own_all" on public.announcement_reads
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create index if not exists idx_tasks_category on public.tasks(category);
create index if not exists idx_task_checklist_items_task on public.task_checklist_items(task_id, position);
create index if not exists idx_announcement_reads_user on public.announcement_reads(user_id, announcement_id);

insert into public.task_checklist_items (task_id, title, position, created_by)
values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Хуучин onboarding материалуудыг шалгах', 1, '11111111-1111-1111-1111-111111111111'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Шинэ багшийн эхний 7 хоногийн дараалал бичих', 2, '11111111-1111-1111-1111-111111111111'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Давтамжтай асуултуудыг нэгтгэх', 1, '11111111-1111-1111-1111-111111111111'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Эвдэрсэн Google Drive линкүүдийг тэмдэглэх', 1, '11111111-1111-1111-1111-111111111111')
on conflict do nothing;

update public.tasks set category = 'Сургалт' where id in ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2');
update public.tasks set category = 'Дотоод ажил' where id in ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4');
update public.tasks set category = 'Сургалтын сан' where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5';

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
    or new.category is distinct from old.category
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
