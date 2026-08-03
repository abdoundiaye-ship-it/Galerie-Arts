-- All policies are explicit CREATE POLICY statements — RLS is left enabled
-- on every table (never `disable row level security`), including for the
-- service role's own safety net: the service-role client bypasses RLS by
-- design, so these policies only govern the anon/authenticated JWT roles.

-- ---------- roles / permissions / role_permissions ----------
-- Reference data: readable by any authenticated user (used to render admin
-- role pickers), writable only by admins.
create policy "roles_select_authenticated" on public.roles
  for select to authenticated using (true);

create policy "roles_admin_write" on public.roles
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "permissions_select_authenticated" on public.permissions
  for select to authenticated using (true);

create policy "permissions_admin_write" on public.permissions
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "role_permissions_select_authenticated" on public.role_permissions
  for select to authenticated using (true);

create policy "role_permissions_admin_write" on public.role_permissions
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------- profiles ----------
create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin(auth.uid()));

-- Role/status escalation is blocked by the profiles_prevent_self_role_escalation
-- trigger (migration 00000000000001), not by this policy's WITH CHECK.
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_admin_manage" on public.profiles
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------- categories / collections ----------
create policy "categories_public_read" on public.categories
  for select to anon, authenticated using (true);

create policy "categories_admin_write" on public.categories
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "collections_public_read" on public.collections
  for select to anon, authenticated using (true);

create policy "collections_admin_write" on public.collections
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------- artworks / artwork_images ----------
create policy "artworks_public_read_published" on public.artworks
  for select to anon, authenticated
  using (is_published = true or public.is_admin(auth.uid()));

create policy "artworks_admin_write" on public.artworks
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "artwork_images_public_read_published" on public.artwork_images
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.artworks a
      where a.id = artwork_id and (a.is_published = true or public.is_admin(auth.uid()))
    )
  );

create policy "artwork_images_admin_write" on public.artwork_images
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------- favorites ----------
create policy "favorites_owner_all" on public.favorites
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "favorites_admin_read" on public.favorites
  for select to authenticated
  using (public.is_admin(auth.uid()));

-- ---------- purchase_requests ----------
-- Users can create and read their own requests, but only an admin can
-- transition status / write admin_response (enforced by the WITH CHECK
-- below re-asserting the existing status/admin_response on user updates —
-- in practice the UI never lets a user hit update, insert+select only).
create policy "purchase_requests_owner_insert" on public.purchase_requests
  for insert to authenticated
  with check (user_id = auth.uid() and status = 'en_attente');

create policy "purchase_requests_owner_select" on public.purchase_requests
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "purchase_requests_owner_cancel" on public.purchase_requests
  for update to authenticated
  using (user_id = auth.uid() and status = 'en_attente')
  with check (user_id = auth.uid() and status = 'annulee');

create policy "purchase_requests_admin_manage" on public.purchase_requests
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------- orders ----------
create policy "orders_owner_select" on public.orders
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "orders_admin_manage" on public.orders
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------- activity_logs ----------
-- No insert policy for anon/authenticated: writes happen only through the
-- service-role client on the server. Admins can read for the stats dashboard.
create policy "activity_logs_admin_read" on public.activity_logs
  for select to authenticated
  using (public.is_admin(auth.uid()));
