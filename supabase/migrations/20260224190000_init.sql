create extension if not exists "pgcrypto";

create table if not exists public.deadlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  due_date timestamptz not null,
  amount_cents bigint,
  currency text not null default 'EUR',
  status text not null default 'pending' check (status in ('pending', 'completed', 'overdue')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (amount_cents is null or amount_cents >= 0),
  check (char_length(currency) = 3)
);

create table if not exists public.checklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references public.checklists(id) on delete cascade,
  label text not null,
  is_done boolean not null default false,
  due_date timestamptz,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  context_type text not null,
  recipient text,
  language text not null default 'English',
  tone text not null default 'Professional',
  input_json jsonb not null default '{}'::jsonb,
  subject text not null,
  body text not null,
  status text not null default 'draft' check (status in ('draft', 'final')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  payee text not null,
  amount_cents bigint not null check (amount_cents > 0),
  currency text not null default 'EUR' check (char_length(currency) = 3),
  paid_at timestamptz not null,
  proof_url text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text not null default 'inactive' check (status in ('active', 'trialing', 'past_due', 'canceled', 'inactive')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.telemetry_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  page text not null,
  sentiment text not null check (sentiment in ('positive', 'neutral', 'negative')),
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.stripe_webhook_events (
  id bigint generated always as identity primary key,
  stripe_event_id text not null unique,
  event_type text not null,
  created_at timestamptz not null default now()
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

drop trigger if exists set_deadlines_updated_at on public.deadlines;
create trigger set_deadlines_updated_at before update on public.deadlines
for each row execute function public.set_updated_at();

drop trigger if exists set_checklists_updated_at on public.checklists;
create trigger set_checklists_updated_at before update on public.checklists
for each row execute function public.set_updated_at();

drop trigger if exists set_checklist_items_updated_at on public.checklist_items;
create trigger set_checklist_items_updated_at before update on public.checklist_items
for each row execute function public.set_updated_at();

drop trigger if exists set_email_drafts_updated_at on public.email_drafts;
create trigger set_email_drafts_updated_at before update on public.email_drafts
for each row execute function public.set_updated_at();

drop trigger if exists set_payment_logs_updated_at on public.payment_logs;
create trigger set_payment_logs_updated_at before update on public.payment_logs
for each row execute function public.set_updated_at();

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at before update on public.subscriptions
for each row execute function public.set_updated_at();

alter table public.deadlines enable row level security;
alter table public.checklists enable row level security;
alter table public.checklist_items enable row level security;
alter table public.email_drafts enable row level security;
alter table public.payment_logs enable row level security;
alter table public.subscriptions enable row level security;
alter table public.telemetry_feedback enable row level security;

-- deadlines
drop policy if exists deadlines_select_own on public.deadlines;
create policy deadlines_select_own on public.deadlines
for select using (auth.uid() = user_id);

drop policy if exists deadlines_insert_own on public.deadlines;
create policy deadlines_insert_own on public.deadlines
for insert with check (auth.uid() = user_id);

drop policy if exists deadlines_update_own on public.deadlines;
create policy deadlines_update_own on public.deadlines
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists deadlines_delete_own on public.deadlines;
create policy deadlines_delete_own on public.deadlines
for delete using (auth.uid() = user_id);

-- checklists
drop policy if exists checklists_select_own on public.checklists;
create policy checklists_select_own on public.checklists
for select using (auth.uid() = user_id);

drop policy if exists checklists_insert_own on public.checklists;
create policy checklists_insert_own on public.checklists
for insert with check (auth.uid() = user_id);

drop policy if exists checklists_update_own on public.checklists;
create policy checklists_update_own on public.checklists
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists checklists_delete_own on public.checklists;
create policy checklists_delete_own on public.checklists
for delete using (auth.uid() = user_id);

-- checklist items resolve ownership through parent checklist
drop policy if exists checklist_items_select_own on public.checklist_items;
create policy checklist_items_select_own on public.checklist_items
for select using (
  exists (
    select 1
    from public.checklists c
    where c.id = checklist_id
      and c.user_id = auth.uid()
  )
);

drop policy if exists checklist_items_insert_own on public.checklist_items;
create policy checklist_items_insert_own on public.checklist_items
for insert with check (
  exists (
    select 1
    from public.checklists c
    where c.id = checklist_id
      and c.user_id = auth.uid()
  )
);

drop policy if exists checklist_items_update_own on public.checklist_items;
create policy checklist_items_update_own on public.checklist_items
for update using (
  exists (
    select 1
    from public.checklists c
    where c.id = checklist_id
      and c.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.checklists c
    where c.id = checklist_id
      and c.user_id = auth.uid()
  )
);

drop policy if exists checklist_items_delete_own on public.checklist_items;
create policy checklist_items_delete_own on public.checklist_items
for delete using (
  exists (
    select 1
    from public.checklists c
    where c.id = checklist_id
      and c.user_id = auth.uid()
  )
);

-- email drafts
drop policy if exists email_drafts_select_own on public.email_drafts;
create policy email_drafts_select_own on public.email_drafts
for select using (auth.uid() = user_id);

drop policy if exists email_drafts_insert_own on public.email_drafts;
create policy email_drafts_insert_own on public.email_drafts
for insert with check (auth.uid() = user_id);

drop policy if exists email_drafts_update_own on public.email_drafts;
create policy email_drafts_update_own on public.email_drafts
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists email_drafts_delete_own on public.email_drafts;
create policy email_drafts_delete_own on public.email_drafts
for delete using (auth.uid() = user_id);

-- payment logs
drop policy if exists payment_logs_select_own on public.payment_logs;
create policy payment_logs_select_own on public.payment_logs
for select using (auth.uid() = user_id);

drop policy if exists payment_logs_insert_own on public.payment_logs;
create policy payment_logs_insert_own on public.payment_logs
for insert with check (auth.uid() = user_id);

drop policy if exists payment_logs_update_own on public.payment_logs;
create policy payment_logs_update_own on public.payment_logs
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists payment_logs_delete_own on public.payment_logs;
create policy payment_logs_delete_own on public.payment_logs
for delete using (auth.uid() = user_id);

-- subscriptions
drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own on public.subscriptions
for select using (auth.uid() = user_id);

-- telemetry feedback
drop policy if exists telemetry_feedback_select_own on public.telemetry_feedback;
create policy telemetry_feedback_select_own on public.telemetry_feedback
for select using (auth.uid() = user_id);

drop policy if exists telemetry_feedback_insert_own on public.telemetry_feedback;
create policy telemetry_feedback_insert_own on public.telemetry_feedback
for insert with check (auth.uid() = user_id);

create index if not exists idx_deadlines_user_due_date on public.deadlines (user_id, due_date);
create index if not exists idx_checklists_user_created on public.checklists (user_id, created_at desc);
create index if not exists idx_checklist_items_checklist_sort on public.checklist_items (checklist_id, sort_order);
create index if not exists idx_email_drafts_user_created on public.email_drafts (user_id, created_at desc);
create index if not exists idx_payment_logs_user_paid_at on public.payment_logs (user_id, paid_at desc);
create index if not exists idx_subscriptions_user on public.subscriptions (user_id);
create index if not exists idx_telemetry_feedback_user_created on public.telemetry_feedback (user_id, created_at desc);
