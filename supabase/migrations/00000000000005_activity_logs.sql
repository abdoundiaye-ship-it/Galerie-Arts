-- activity_logs is written exclusively by the server (service-role client)
-- from Server Actions / Route Handlers — never directly from the browser.
-- This is why there is no INSERT policy for anon/authenticated below:
-- the service role bypasses RLS entirely, which is the intended path.
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index activity_logs_user_id_idx on public.activity_logs (user_id);
create index activity_logs_action_idx on public.activity_logs (action);
create index activity_logs_entity_idx on public.activity_logs (entity_type, entity_id);
create index activity_logs_created_at_idx on public.activity_logs (created_at desc);

alter table public.activity_logs enable row level security;
