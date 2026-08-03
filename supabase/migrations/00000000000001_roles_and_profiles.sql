-- Roles, permissions and profiles: the identity/authorization layer.
-- Design note: roles are data (not a hardcoded enum) so the admin UI can
-- manage fine-grained permissions later without a schema migration.

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

create table public.roles (
  id smallint generated always as identity primary key,
  name text not null unique,
  description text
);

comment on table public.roles is 'Named roles: admin, client_autorise, visiteur.';

insert into public.roles (name, description) values
  ('admin', 'Acces complet a l''administration et au catalogue'),
  ('client_autorise', 'Client valide manuellement, peut consulter et demander l''achat des oeuvres'),
  ('visiteur', 'Compte cree mais pas encore valide par un administrateur');

create table public.permissions (
  id smallint generated always as identity primary key,
  code text not null unique,
  description text
);

insert into public.permissions (code, description) values
  ('artworks.manage', 'Creer/modifier/supprimer des oeuvres'),
  ('categories.manage', 'Gerer les categories et collections'),
  ('users.manage', 'Gerer les utilisateurs et leurs roles'),
  ('requests.manage', 'Traiter les demandes d''achat'),
  ('stats.view', 'Consulter les statistiques de consultation et de vente');

create table public.role_permissions (
  role_id smallint not null references public.roles (id) on delete cascade,
  permission_id smallint not null references public.permissions (id) on delete cascade,
  primary key (role_id, permission_id)
);

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'admin';

-- One profile row per auth user. status tracks the "client autorise"
-- approval workflow independently of the base role.
create type public.profile_status as enum (
  'en_attente_validation',
  'client_autorise',
  'rejete',
  'admin'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role_id smallint not null references public.roles (id),
  status public.profile_status not null default 'en_attente_validation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_id_idx on public.profiles (role_id);

-- Helper used throughout RLS policies: SECURITY DEFINER so it can read
-- public.profiles regardless of the calling role's own RLS visibility,
-- without ever exposing write access.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = uid and r.name = 'admin'
  );
$$;

create or replace function public.is_client_autorise(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.status = 'client_autorise'
  );
$$;

-- New auth.users rows automatically get a profile with the default role.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  visitor_role_id smallint;
begin
  select id into visitor_role_id from public.roles where name = 'visiteur';

  insert into public.profiles (id, full_name, role_id, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    visitor_role_id,
    'en_attente_validation'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Belt-and-suspenders against privilege escalation: even though the RLS
-- policy on profiles restricts UPDATE to the owner row, a self-referential
-- WITH CHECK subquery on the same table has unreliable snapshot semantics
-- mid-statement. A trigger comparing OLD/NEW directly is unambiguous.
create or replace function public.prevent_self_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin(auth.uid()) then
    if new.role_id is distinct from old.role_id or new.status is distinct from old.status then
      raise exception 'Seul un administrateur peut modifier le role ou le statut d''un profil';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_self_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_self_role_escalation();

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.profiles enable row level security;
