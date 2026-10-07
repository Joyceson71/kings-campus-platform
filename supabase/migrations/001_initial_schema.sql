create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

create type app_role as enum ('admin', 'faculty', 'student');
create type attendance_status as enum ('present', 'late', 'absent', 'excused');
create type verification_method as enum ('qr', 'face', 'geo', 'qr_face_geo', 'manual');
create type submission_status as enum ('draft', 'submitted', 'late', 'resubmitted', 'graded');
create type test_mode as enum ('objective', 'subjective', 'programming');

create table departments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role app_role not null default 'student',
  full_name text not null,
  avatar_url text,
  department_id uuid references departments(id),
  phone text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table students (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references profiles(id) on delete cascade,
  roll_number text not null unique,
  semester int not null check (semester between 1 and 8),
  section text not null,
  enrollment_photo_path text,
  device_fingerprint text,
  xp int not null default 0,
  coins int not null default 0,
  study_streak int not null default 0,
  attendance_streak int not null default 0
);

create table faculty (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references profiles(id) on delete cascade,
  employee_code text not null unique,
  designation text not null,
  office_hours text
);

create table admins (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references profiles(id) on delete cascade,
  scope text not null default 'campus'
);

create table subjects (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references departments(id),
  code text not null unique,
  name text not null,
  semester int not null check (semester between 1 and 8),
  credits int not null default 3
);

create table classes (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id),
  faculty_id uuid not null references faculty(id),
  section text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  room text not null
);

create table attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  faculty_id uuid not null references faculty(id),
  qr_token_hash text not null,
  rotates_every_seconds int not null default 30 check (rotates_every_seconds between 10 and 120),
  expires_at timestamptz not null,
  latitude numeric(9,6) not null,
  longitude numeric(9,6) not null,
  radius_meters int not null default 100 check (radius_meters between 10 and 1000),
  min_face_confidence numeric(4,3) not null default .760,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table attendance (
  id uuid primary key default gen_random_uuid(),
  attendance_session_id uuid not null references attendance_sessions(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  status attendance_status not null,
  verification_method verification_method not null,
  face_confidence numeric(4,3),
  latitude numeric(9,6),
  longitude numeric(9,6),
  device_id text,
  marked_at timestamptz not null default now(),
  unique(attendance_session_id, student_id)
);

create table attendance_logs (
  id uuid primary key default gen_random_uuid(),
  attendance_session_id uuid references attendance_sessions(id) on delete cascade,
  student_id uuid references students(id) on delete cascade,
  accepted boolean not null,
  reason text not null,
  face_confidence numeric(4,3),
  latitude numeric(9,6),
  longitude numeric(9,6),
  distance_meters numeric(10,2),
  ip_address text,
  user_agent text,
  device_id text,
  created_at timestamptz not null default now()
);

create table courses (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references departments(id),
  title text not null,
  slug text not null unique,
  description text not null,
  level text not null,
  created_by uuid references faculty(id),
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  content jsonb not null default '{}',
  sort_order int not null default 0
);

create table learning_progress (
  student_id uuid references students(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  progress numeric(5,2) not null default 0,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key(student_id, course_id)
);

create table resource_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table resources (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references resource_categories(id),
  subject_id uuid references subjects(id),
  uploaded_by uuid references profiles(id),
  title text not null,
  resource_type text not null,
  storage_path text not null,
  author text,
  semester int,
  downloads int not null default 0,
  searchable tsvector generated always as (to_tsvector('english', title || ' ' || coalesce(author,''))) stored,
  created_at timestamptz not null default now()
);

create table assignments (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id),
  faculty_id uuid not null references faculty(id),
  title text not null,
  instructions text not null,
  rubric jsonb not null default '[]',
  max_marks numeric(6,2) not null,
  due_at timestamptz not null,
  allow_resubmission boolean not null default true,
  created_at timestamptz not null default now()
);

create table assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  status submission_status not null default 'submitted',
  storage_paths text[] not null default '{}',
  similarity_score numeric(5,2),
  marks numeric(6,2),
  feedback text,
  submitted_at timestamptz not null default now(),
  graded_at timestamptz,
  unique(assignment_id, student_id)
);

create table tests (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id),
  faculty_id uuid not null references faculty(id),
  title text not null,
  mode test_mode not null,
  duration_minutes int not null,
  negative_marking numeric(4,2) not null default 0,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  published boolean not null default false
);

create table question_bank (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id),
  created_by uuid references faculty(id),
  question text not null,
  mode test_mode not null,
  difficulty text not null,
  options jsonb,
  answer jsonb,
  marks numeric(6,2) not null default 1,
  tags text[] not null default '{}'
);

create table questions (
  test_id uuid references tests(id) on delete cascade,
  question_id uuid references question_bank(id) on delete cascade,
  sort_order int not null default 0,
  primary key(test_id, question_id)
);

create table results (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references tests(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  score numeric(6,2),
  max_score numeric(6,2),
  answers jsonb not null default '{}',
  auto_evaluated boolean not null default false,
  submitted_at timestamptz,
  unique(test_id, student_id)
);

create table chat_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  room_type text not null check (room_type in ('one_to_one','class','department','study','announcement')),
  department_id uuid references departments(id),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references chat_rooms(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  attachments jsonb not null default '[]',
  pinned boolean not null default false,
  reported boolean not null default false,
  created_at timestamptz not null default now()
);

create table study_groups (
  id uuid primary key default gen_random_uuid(),
  department_id uuid references departments(id),
  name text not null,
  description text not null,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table bookmarks (
  profile_id uuid references profiles(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  created_at timestamptz not null default now(),
  primary key(profile_id, target_type, target_id)
);

create table badges (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null,
  xp_reward int not null default 0
);

create table achievements (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  badge_id uuid not null references badges(id),
  awarded_at timestamptz not null default now(),
  unique(student_id, badge_id)
);

create table leaderboards (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  period text not null,
  student_id uuid not null references students(id) on delete cascade,
  score int not null,
  rank int not null,
  generated_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text not null,
  channel text not null default 'realtime',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid references profiles(id),
  report_type text not null,
  filters jsonb not null default '{}',
  storage_path text,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id),
  activity_type text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_profiles_role on profiles(role);
create index idx_attendance_student on attendance(student_id, marked_at desc);
create index idx_attendance_logs_session on attendance_logs(attendance_session_id, created_at desc);
create index idx_resources_search on resources using gin(searchable);
create index idx_messages_room_created on messages(room_id, created_at desc);
create index idx_notifications_profile on notifications(profile_id, read_at, created_at desc);
create index idx_audit_logs_created on audit_logs(created_at desc);

create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at before update on profiles
for each row execute function touch_updated_at();

create or replace function current_profile_role()
returns app_role language sql stable as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_admin()
returns boolean language sql stable as $$
  select current_profile_role() = 'admin';
$$;

create or replace function is_faculty()
returns boolean language sql stable as $$
  select current_profile_role() in ('faculty','admin');
$$;

create or replace function log_audit_event()
returns trigger language plpgsql security definer as $$
begin
  insert into audit_logs(actor_id, action, entity, entity_id, metadata)
  values (auth.uid(), tg_op, tg_table_name, coalesce(new.id, old.id), jsonb_build_object('table', tg_table_name));
  return coalesce(new, old);
end;
$$;

create trigger audit_attendance after insert or update or delete on attendance
for each row execute function log_audit_event();
create trigger audit_assignments after insert or update or delete on assignments
for each row execute function log_audit_event();
create trigger audit_tests after insert or update or delete on tests
for each row execute function log_audit_event();

create or replace view admin_realtime_analytics as
select
  (select count(*) from profiles where status = 'active') as active_users,
  (select count(*) from attendance where marked_at::date = current_date and status = 'present') as present_today,
  (select count(*) from assignment_submissions where submitted_at::date = current_date) as submissions_today,
  (select count(*) from messages where created_at > now() - interval '1 hour') as messages_last_hour;

create or replace view student_performance_summary as
select
  s.id as student_id,
  p.full_name,
  coalesce(avg(r.score / nullif(r.max_score,0) * 100), 0) as test_average,
  coalesce(avg(lp.progress), 0) as learning_progress,
  count(a.id) filter (where a.status = 'present') as present_count
from students s
join profiles p on p.id = s.profile_id
left join results r on r.student_id = s.id
left join learning_progress lp on lp.student_id = s.id
left join attendance a on a.student_id = s.id
group by s.id, p.full_name;

alter table profiles enable row level security;
alter table students enable row level security;
alter table faculty enable row level security;
alter table admins enable row level security;
alter table departments enable row level security;
alter table subjects enable row level security;
alter table classes enable row level security;
alter table attendance_sessions enable row level security;
alter table attendance enable row level security;
alter table attendance_logs enable row level security;
alter table courses enable row level security;
alter table course_modules enable row level security;
alter table learning_progress enable row level security;
alter table resource_categories enable row level security;
alter table resources enable row level security;
alter table assignments enable row level security;
alter table assignment_submissions enable row level security;
alter table tests enable row level security;
alter table question_bank enable row level security;
alter table questions enable row level security;
alter table results enable row level security;
alter table chat_rooms enable row level security;
alter table messages enable row level security;
alter table study_groups enable row level security;
alter table bookmarks enable row level security;
alter table badges enable row level security;
alter table achievements enable row level security;
alter table leaderboards enable row level security;
alter table notifications enable row level security;
alter table reports enable row level security;
alter table audit_logs enable row level security;
alter table activity_logs enable row level security;

create policy "profiles read own or admin" on profiles for select using (id = auth.uid() or is_admin());
create policy "profiles update own" on profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "admins manage all" on profiles for all using (is_admin()) with check (is_admin());

create policy "departments readable" on departments for select using (auth.uid() is not null);
create policy "subjects readable" on subjects for select using (auth.uid() is not null);
create policy "classes readable" on classes for select using (auth.uid() is not null);
create policy "faculty manage classes" on classes for all using (is_faculty()) with check (is_faculty());

create policy "student own row" on students for select using (profile_id = auth.uid() or is_faculty());
create policy "faculty readable" on faculty for select using (auth.uid() is not null);
create policy "admin rows admin" on admins for select using (is_admin());

create policy "faculty sessions manage" on attendance_sessions for all using (is_faculty()) with check (is_faculty());
create policy "sessions readable" on attendance_sessions for select using (auth.uid() is not null);
create policy "attendance own or faculty" on attendance for select using (
  is_faculty() or exists (select 1 from students s where s.id = attendance.student_id and s.profile_id = auth.uid())
);
create policy "students insert own attendance" on attendance for insert with check (
  exists (select 1 from students s where s.id = attendance.student_id and s.profile_id = auth.uid())
);
create policy "logs own or faculty" on attendance_logs for select using (
  is_faculty() or exists (select 1 from students s where s.id = attendance_logs.student_id and s.profile_id = auth.uid())
);
create policy "insert attendance logs authenticated" on attendance_logs for insert with check (auth.uid() is not null);

create policy "published courses readable" on courses for select using (published or is_faculty());
create policy "faculty manage courses" on courses for all using (is_faculty()) with check (is_faculty());
create policy "modules readable" on course_modules for select using (auth.uid() is not null);
create policy "own learning progress" on learning_progress for all using (
  exists (select 1 from students s where s.id = learning_progress.student_id and s.profile_id = auth.uid()) or is_faculty()
) with check (
  exists (select 1 from students s where s.id = learning_progress.student_id and s.profile_id = auth.uid()) or is_faculty()
);

create policy "resources readable" on resources for select using (auth.uid() is not null);
create policy "faculty upload resources" on resources for insert with check (is_faculty());
create policy "categories readable" on resource_categories for select using (auth.uid() is not null);

create policy "assignments readable" on assignments for select using (auth.uid() is not null);
create policy "faculty manage assignments" on assignments for all using (is_faculty()) with check (is_faculty());
create policy "submissions own or faculty" on assignment_submissions for select using (
  is_faculty() or exists (select 1 from students s where s.id = assignment_submissions.student_id and s.profile_id = auth.uid())
);
create policy "students submit own" on assignment_submissions for insert with check (
  exists (select 1 from students s where s.id = assignment_submissions.student_id and s.profile_id = auth.uid())
);

create policy "tests readable" on tests for select using (auth.uid() is not null);
create policy "faculty manage tests" on tests for all using (is_faculty()) with check (is_faculty());
create policy "question bank faculty" on question_bank for all using (is_faculty()) with check (is_faculty());
create policy "questions faculty" on questions for all using (is_faculty()) with check (is_faculty());
create policy "results own or faculty" on results for select using (
  is_faculty() or exists (select 1 from students s where s.id = results.student_id and s.profile_id = auth.uid())
);

create policy "chat rooms readable" on chat_rooms for select using (auth.uid() is not null);
create policy "messages readable" on messages for select using (auth.uid() is not null);
create policy "messages insert own" on messages for insert with check (sender_id = auth.uid());
create policy "bookmarks own" on bookmarks for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "notifications own" on notifications for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "badges readable" on badges for select using (auth.uid() is not null);
create policy "achievements own or faculty" on achievements for select using (
  is_faculty() or exists (select 1 from students s where s.id = achievements.student_id and s.profile_id = auth.uid())
);
create policy "leaderboards readable" on leaderboards for select using (auth.uid() is not null);
create policy "reports faculty" on reports for all using (is_faculty()) with check (is_faculty());
create policy "audit admin only" on audit_logs for select using (is_admin());
create policy "activity own or admin" on activity_logs for select using (profile_id = auth.uid() or is_admin());

insert into departments(code, name) values
('CSE','Computer Science and Engineering'),
('AIDS','Artificial Intelligence and Data Science'),
('ECE','Electronics and Communication Engineering'),
('EEE','Electrical and Electronics Engineering'),
('MECH','Mechanical Engineering'),
('CIVIL','Civil Engineering')
on conflict do nothing;

insert into resource_categories(name) values
('Books'),('PDF'),('PPT'),('Lab Manuals'),('Question Papers'),('Research Papers'),('Notes')
on conflict do nothing;

insert into badges(code, name, description, xp_reward) values
('ATTENDANCE_ACE','Attendance Ace','Maintained a 30-day attendance streak.',500),
('TOP_HELPER','Top Helper','Helped classmates in study rooms.',350),
('RESEARCH_STAR','Research Star','Published excellent resource notes.',400),
('FOCUS_CHAMPION','Focus Champion','Completed weekly focus missions.',250)
on conflict do nothing;

insert into subjects(department_id, code, name, semester)
select id, 'CS301', 'Data Structures', 3 from departments where code = 'CSE'
on conflict do nothing;

insert into courses(department_id, title, slug, description, level, published)
select id, 'Programming Mastery', 'programming-mastery', 'Roadmaps, labs, practice questions, projects, and assessments for modern programming.', 'Intermediate', true
from departments where code = 'CSE'
on conflict do nothing;

-- Run in Supabase SQL editor after storage is enabled:
-- insert into storage.buckets(id, name, public) values
-- ('avatars','avatars',true),
-- ('resources','resources',false),
-- ('submissions','submissions',false),
-- ('certificates','certificates',false)
-- on conflict do nothing;
