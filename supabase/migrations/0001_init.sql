-- סכמת בסיס הנתונים לכלי ניהול נוהל "לקוח חדש"
-- מריצים ב-Supabase SQL Editor (או דרך supabase CLI).

-- ── סוגי enum ─────────────────────────────────────────────
create type role_type as enum ('pm', 'product', 'dev', 'qa');
create type customer_status as enum ('active', 'on_hold', 'completed');
create type deliverable_status as enum ('todo', 'in_progress', 'done');

-- ── משתמשים (מקושר ל-auth.users של Supabase) ───────────────
create table app_users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role role_type not null default 'pm',
  created_at timestamptz not null default now()
);

-- ── לקוחות (כל לקוח = מופע נוהל) ────────────────────────────
create table customers (
  id uuid primary key default gen_random_uuid (),
  name text not null,
  project_type text,
  start_date date,
  status customer_status not null default 'active',
  current_stage int not null default 1 check (current_stage between 1 and 4),
  created_by uuid references app_users (id),
  created_at timestamptz not null default now()
);

-- ── מופעי תוצר לכל לקוח ─────────────────────────────────────
-- deliverable_key מתייחס למפתח ב-lib/process-definition.ts (מקור האמת של המבנה).
create table customer_deliverables (
  id uuid primary key default gen_random_uuid (),
  customer_id uuid not null references customers (id) on delete cascade,
  deliverable_key text not null,
  status deliverable_status not null default 'todo',
  due_date date,
  content jsonb,
  meeting_date date,
  note text,
  file_url text,
  updated_by uuid references app_users (id),
  updated_at timestamptz not null default now(),
  unique (customer_id, deliverable_key)
);

create index on customer_deliverables (customer_id);

-- ── סיכומים שבועיים (שלב 3 / Asana) ─────────────────────────
create table weekly_summaries (
  id uuid primary key default gen_random_uuid (),
  customer_id uuid not null references customers (id) on delete cascade,
  week_of date not null,
  summary text not null,
  created_by uuid references app_users (id),
  created_at timestamptz not null default now()
);

create index on weekly_summaries (customer_id);

-- ── לוג מעברי שלב ───────────────────────────────────────────
create table stage_transitions (
  id uuid primary key default gen_random_uuid (),
  customer_id uuid not null references customers (id) on delete cascade,
  from_stage int not null,
  to_stage int not null,
  approved_by uuid references app_users (id),
  created_at timestamptz not null default now()
);

-- ── שמירת updated_at אוטומטית ───────────────────────────────
create or replace function set_updated_at () returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_deliverables_updated
  before update on customer_deliverables
  for each row execute function set_updated_at ();
