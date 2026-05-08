# Nomadic Workspace

Nomadic Workspace is the first MVP prototype for an internal Nomadic teacher/team workspace. It is not a student, classroom, attendance, homework, grade, parent, enrollment, or LMS system.

The MVP helps internal teachers reduce daily work confusion by keeping tasks, responsibilities, announcements, materials, notifications, and NotebookLM training links in one calm dashboard.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style local components
- Supabase Auth
- Supabase Postgres
- Supabase Row Level Security
- Server Actions

## Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` is reserved for server-side admin operations and must never be exposed to the client.

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Supabase Setup

Apply the SQL migration in:

```text
supabase/migrations/001_initial_schema.sql
```

For the To Do workflow improvements, also apply:

```text
supabase/migrations/002_workspace_todo_improvements.sql
```

Then seed placeholder local data with:

```text
supabase/seed.sql
```

Sample local users in the seed use password `Nomadic123!`.

- `admin@nomadic.mn`
- `teacher1@nomadic.mn`
- `teacher2@nomadic.mn`
- `teacher3@nomadic.mn`

For hosted Supabase projects, you can apply the migration through the Supabase SQL editor or CLI. Promote a real user to admin manually by updating `profiles.role = 'admin'`.

## Routes

- `/login` - нэвтрэх, бүртгүүлэх
- `/dashboard` - үндсэн самбар
- `/tasks` - ажил харах, шүүх
- `/tasks/new` - admin-only ажил үүсгэх
- `/tasks/[id]` - ажлын дэлгэрэнгүй
- `/announcements` - зарлал
- `/materials` - материал хайх
- `/training` - NotebookLM холбоостой сургалтын сан
- `/notifications` - мэдэгдэл
- `/settings/profile` - профайл

## Roles

`admin`

- Бүх ажил харах, үүсгэх, засах, устгах
- Багш нарт ажил оноох
- Зарлал, сургалтын ресурс, материал удирдах
- Багш нарт in-app notification үүсгэх

`teacher`

- Зөвхөн өөрт оноогдсон ажлыг харах
- Оноогдсон ажлын төлөв шинэчлэх
- Оноогдсон ажил дээр сэтгэгдэл бичих
- Холбогдсон материал харах
- Идэвхтэй сургалтын ресурс харах
- NotebookLM холбоосыг шинэ tab-д нээх
- Өөрийн хувийн сургалтын тэмдэглэл удирдах
- Өөрийн мэдэгдэл, профайлыг харах/шинэчлэх

## Security Notes

- All app routes are protected by Supabase Auth middleware.
- RLS is enabled on every public table.
- Teachers cannot read other teachers' assigned tasks, materials, private notes, or notifications.
- Teachers can update only `status` on assigned tasks; a database trigger blocks protected column changes.
- Notification updates are limited to read-state changes by database trigger.
- Admin server actions perform server-side role checks.

## Future Extension Notes

The structure leaves room for future Nomadic modules:

- Bunny Stream video lessons
- QPay payment system
- larger app modules
- AI search
- mobile push notifications
- advanced workflow automation

Those features are intentionally not implemented in this MVP.
