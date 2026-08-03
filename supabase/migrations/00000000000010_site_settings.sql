-- Singleton table (always exactly one row, id fixed to true) for the
-- handful of site-wide fields an admin should be able to edit without a
-- deploy: display name, tagline, public contact email. Deliberately not a
-- generic key/value store — that would be speculative flexibility for
-- settings that don't exist yet (YAGNI). Add columns here if/when a real
-- new setting is needed.
create table public.site_settings (
  id boolean primary key default true,
  site_name text not null,
  tagline text,
  contact_email text,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id)
);

insert into public.site_settings (id, site_name, tagline, contact_email)
values (true, 'Makhete Wade — Galerie d''Art Virtuelle', 'Presenter, Admirer, Acquerir', null);

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

create policy "site_settings_public_read" on public.site_settings
  for select to anon, authenticated
  using (true);

create policy "site_settings_admin_write" on public.site_settings
  for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
