-- Simplifies the role model to exactly two business roles (admin,
-- visiteur) plus an orthogonal Active/Inactive account status. The old
-- 3-way split (admin / client_autorise / visiteur as roles, with a
-- 4-value profile_status enum layered on top) conflated "what can this
-- account do" (role) with "has an admin cleared this account" (status)
-- in a confusing way. Going forward:
--   - role_id (admin | visiteur, extensible via the existing roles table
--     for future Curator/Artist/Sales Manager/... without a migration)
--   - is_active (boolean) is the purchase-gate: a freshly registered
--     visiteur starts inactive (browse-only) until an admin activates
--     the account; deactivating an account (including an admin's) fully
--     revokes access without deleting anything.

alter table public.profiles add column is_active boolean not null default false;

-- Backfill from the old status values before dropping them.
update public.profiles set is_active = true where status in ('client_autorise', 'admin');

-- Merge the old client_autorise role into visiteur (it was never a
-- distinct permission set, just a status masquerading as a role).
update public.profiles p
set role_id = (select id from public.roles where name = 'visiteur')
where role_id = (select id from public.roles where name = 'client_autorise');

delete from public.role_permissions
where role_id = (select id from public.roles where name = 'client_autorise');

delete from public.roles where name = 'client_autorise';

drop function if exists public.is_client_autorise(uuid);

alter table public.profiles drop column status;
drop type if exists public.profile_status;

-- Escalation guard now protects role_id AND is_active (a non-admin must
-- not be able to activate their own account any more than they could
-- promote themselves to admin under the old model).
create or replace function public.prevent_self_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin(auth.uid()) then
    if new.role_id is distinct from old.role_id or new.is_active is distinct from old.is_active then
      raise exception 'Seul un administrateur peut modifier le role ou le statut d''un profil';
    end if;
  end if;
  return new;
end;
$$;

-- New signups: visiteur role, inactive until an admin flips is_active.
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

  insert into public.profiles (id, full_name, role_id, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    visitor_role_id,
    false
  );

  return new;
end;
$$;

-- Purchase requests require an active account — enforced here (RLS), not
-- only in the Server Action, per "validate all permissions server-side."
drop policy if exists "purchase_requests_owner_insert" on public.purchase_requests;
create policy "purchase_requests_owner_insert" on public.purchase_requests
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and status = 'en_attente'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_active)
  );
