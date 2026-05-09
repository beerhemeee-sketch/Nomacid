export type UserRole = "admin" | "teacher";
export type TaskStatus = "new" | "in_progress" | "blocked" | "done";
export type Priority = "low" | "normal" | "high" | "urgent";
export type MaterialType =
  | "link"
  | "google_drive"
  | "pdf"
  | "image"
  | "video_link"
  | "other";

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type TeacherGroup = {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  teacher_group_members?: TeacherGroupMember[];
};

export type TeacherGroupMember = {
  id: string;
  group_id: string;
  teacher_id: string;
  created_at: string;
  profiles?: Profile | null;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  category: string;
  start_date: string | null;
  due_date: string | null;
  sequence_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskWithRelations = Task & {
  task_assignments?: Array<{ teacher_id: string; profiles: Profile | null }>;
  task_materials?: TaskMaterial[];
  task_comments?: TaskCommentWithAuthor[];
  task_checklist_items?: TaskChecklistItem[];
};

export type TaskChecklistItem = {
  id: string;
  task_id: string;
  title: string;
  is_done: boolean;
  position: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskComment = {
  id: string;
  task_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type TaskCommentWithAuthor = TaskComment & {
  profiles: Pick<Profile, "full_name" | "avatar_url"> | null;
};

export type TaskMaterial = {
  id: string;
  task_id: string;
  title: string;
  description: string | null;
  url: string;
  material_type: MaterialType;
  created_by: string | null;
  created_at: string;
  tasks?: Pick<Task, "title" | "category"> | null;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  created_by: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  announcement_reads?: AnnouncementRead[];
};

export type AnnouncementRead = {
  id: string;
  announcement_id: string;
  user_id: string;
  read_at: string;
};

export type TrainingResource = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  notebooklm_url: string;
  source_description: string | null;
  created_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  teacher_training_notes?: TeacherTrainingNote[];
};

export type TeacherTrainingNote = {
  id: string;
  teacher_id: string;
  training_resource_id: string;
  note: string;
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  type:
    | "task_assigned"
    | "task_updated"
    | "comment_added"
    | "announcement"
    | "training_resource";
  is_read: boolean;
  related_task_id: string | null;
  created_at: string;
};

export type Note = {
  id: string;
  title: string;
  type: "text" | "audio";
  audio_url: string | null;
  content: string | null;
  category: string;
  is_shared: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type MeetingRoom = {
  id: string;
  title: string;
  description: string | null;
  room_slug: string;
  starts_at: string | null;
  ends_at: string | null;
  is_premium: boolean;
  price_mnt: number | null;
  checkout_url: string | null;
  replay_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type UserSubscription = {
  id: string;
  user_id: string;
  plan: "free" | "premium";
  status: "active" | "trialing" | "past_due" | "cancelled";
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};
