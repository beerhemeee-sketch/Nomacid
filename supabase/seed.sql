-- Placeholder seed data for local development only.
-- Password for all sample users: Nomadic123!
-- Use a real-looking domain because Supabase Auth rejects reserved .test domains.

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values
('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'admin@nomadic.mn', crypt('Nomadic123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Nomadic Admin"}', now(), now()),
('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'teacher1@nomadic.mn', crypt('Nomadic123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ариун багш"}', now(), now()),
('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'teacher2@nomadic.mn', crypt('Nomadic123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Билгүүн багш"}', now(), now()),
('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'teacher3@nomadic.mn', crypt('Nomadic123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Солонго багш"}', now(), now())
on conflict (id) do nothing;

insert into auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) values
(gen_random_uuid(), 'admin@nomadic.mn', '11111111-1111-1111-1111-111111111111', '{"sub":"11111111-1111-1111-1111-111111111111","email":"admin@nomadic.mn"}', 'email', now(), now(), now()),
(gen_random_uuid(), 'teacher1@nomadic.mn', '22222222-2222-2222-2222-222222222222', '{"sub":"22222222-2222-2222-2222-222222222222","email":"teacher1@nomadic.mn"}', 'email', now(), now(), now()),
(gen_random_uuid(), 'teacher2@nomadic.mn', '33333333-3333-3333-3333-333333333333', '{"sub":"33333333-3333-3333-3333-333333333333","email":"teacher2@nomadic.mn"}', 'email', now(), now(), now()),
(gen_random_uuid(), 'teacher3@nomadic.mn', '44444444-4444-4444-4444-444444444444', '{"sub":"44444444-4444-4444-4444-444444444444","email":"teacher3@nomadic.mn"}', 'email', now(), now(), now())
on conflict do nothing;

insert into public.profiles (id, full_name, role) values
('11111111-1111-1111-1111-111111111111', 'Nomadic Admin', 'admin'),
('22222222-2222-2222-2222-222222222222', 'Ариун багш', 'teacher'),
('33333333-3333-3333-3333-333333333333', 'Билгүүн багш', 'teacher'),
('44444444-4444-4444-4444-444444444444', 'Солонго багш', 'teacher')
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role;

insert into public.tasks (id, title, description, status, priority, start_date, due_date, sequence_order, created_by) values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Шинэ багшийн onboarding checklist цэгцлэх', 'Эхний долоо хоногт дагах дараалал, материалын холбоосуудыг нэгтгэнэ.', 'in_progress', 'high', current_date, current_date + 3, 1, '11111111-1111-1111-1111-111111111111'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Дотоод сургалтын FAQ шинэчлэх', 'Багш нарын давтамжтай асуултуудыг NotebookLM эх сурвалжтай холбож шинэчилнэ.', 'new', 'normal', current_date, current_date + 7, 2, '11111111-1111-1111-1111-111111111111'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Материалын Google Drive хавтас шалгах', 'Алдаатай эсвэл давхардсан холбоосуудыг тэмдэглэнэ.', 'blocked', 'urgent', current_date - 1, current_date + 1, 3, '11111111-1111-1111-1111-111111111111'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'Долоо хоногийн ажлын дараалал гаргах', 'Багийн ажлуудын sequence order-ийг тодорхой болгож санал оруулна.', 'new', 'high', current_date, current_date + 2, 4, '11111111-1111-1111-1111-111111111111'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'Сургалтын тэмдэглэлийн загвар турших', 'Багш бүр хувийн тэмдэглэл бичих flow ойлгомжтой эсэхийг шалгана.', 'done', 'low', current_date - 5, current_date - 1, 5, '11111111-1111-1111-1111-111111111111')
on conflict (id) do nothing;

insert into public.task_assignments (task_id, teacher_id) values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '22222222-2222-2222-2222-222222222222'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '22222222-2222-2222-2222-222222222222'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '33333333-3333-3333-3333-333333333333'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '33333333-3333-3333-3333-333333333333'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', '44444444-4444-4444-4444-444444444444')
on conflict (task_id, teacher_id) do nothing;

insert into public.task_materials (task_id, title, description, url, material_type, created_by) values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Onboarding draft', 'Эхний хувилбарын Google Doc', 'https://drive.google.com/', 'google_drive', '11111111-1111-1111-1111-111111111111'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'FAQ эх сурвалж', 'NotebookLM-д ашиглах эх файл', 'https://docs.google.com/', 'link', '11111111-1111-1111-1111-111111111111'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Drive audit sheet', 'Холбоос шалгах хүснэгт', 'https://sheets.google.com/', 'google_drive', '11111111-1111-1111-1111-111111111111')
on conflict do nothing;

insert into public.announcements (id, title, content, created_by, is_pinned) values
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'MVP туршилт эхэллээ', 'Энэ долоо хоногт ажлын самбарыг туршиж санал хүсэлтээ үлдээнэ үү.', '11111111-1111-1111-1111-111111111111', true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'Материалын холбоосоо шалгана уу', 'Google Drive дээрх хуучин холбоосуудыг шинэчлэх шаардлагатай байна.', '11111111-1111-1111-1111-111111111111', false),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'Сургалтын сангийн эхний хувилбар', 'NotebookLM холбоосуудыг эхний байдлаар орууллаа.', '11111111-1111-1111-1111-111111111111', false)
on conflict (id) do nothing;

insert into public.training_resources (id, title, description, category, notebooklm_url, source_description, created_by, is_active) values
('cccccccc-cccc-cccc-cccc-ccccccccccc1', 'Nomadic багшийн onboarding', 'Шинэ багш эхлэхэд хэрэгтэй дотоод мэдлэг.', 'Onboarding', 'https://notebooklm.google.com/', 'Placeholder NotebookLM notebook', '11111111-1111-1111-1111-111111111111', true),
('cccccccc-cccc-cccc-cccc-ccccccccccc2', 'Багийн ажлын стандарт', 'Ажил хүлээж авах, тодруулах, явц мэдээлэх зөвлөмж.', 'Workflow', 'https://notebooklm.google.com/', 'Placeholder workflow notebook', '11111111-1111-1111-1111-111111111111', true),
('cccccccc-cccc-cccc-cccc-ccccccccccc3', 'Материалын сан ашиглах заавар', 'Файл, холбоос, эх сурвалжийг зөв хадгалах зөвлөмж.', 'Materials', 'https://notebooklm.google.com/', 'Placeholder materials notebook', '11111111-1111-1111-1111-111111111111', true)
on conflict (id) do nothing;

insert into public.teacher_training_notes (teacher_id, training_resource_id, note) values
('22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-ccccccccccc1', 'Эхний checklist дээр өөрийн асуултуудаа нэмэх.'),
('33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-ccccccccccc2', 'Status update жишээг багийн уулзалтаар асуух.')
on conflict (teacher_id, training_resource_id) do nothing;

insert into public.notifications (user_id, title, body, type, related_task_id) values
('22222222-2222-2222-2222-222222222222', 'Шинэ ажил оноогдлоо', 'Шинэ багшийн onboarding checklist цэгцлэх', 'task_assigned', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'),
('33333333-3333-3333-3333-333333333333', 'Ажил дээр шинэчлэл байна', 'Материалын Google Drive хавтас шалгах', 'task_updated', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'),
('44444444-4444-4444-4444-444444444444', 'Сургалтын санд шинэ ресурс нэмэгдлээ', 'Материалын сан ашиглах заавар', 'training_resource', null)
on conflict do nothing;
