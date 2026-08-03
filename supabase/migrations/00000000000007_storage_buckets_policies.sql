-- Three-tier image storage:
--   artworks-original  (private) — full-resolution source, never served directly.
--   artworks-display   (private) — ~1600px derivative, served only via the
--                                   /api/images route which mints short-lived
--                                   signed URLs (or streams a watermarked
--                                   composite) after checking publication state.
--   artworks-thumbnail (public)  — small, heavily compressed grid/SEO images.
insert into storage.buckets (id, name, public, file_size_limit)
values
  ('artworks-original', 'artworks-original', false, 104857600),
  ('artworks-display', 'artworks-display', false, 20971520),
  ('artworks-thumbnail', 'artworks-thumbnail', true, 5242880),
  ('branding', 'branding', true, 5242880)
on conflict (id) do nothing;

create policy "storage_original_admin_only" on storage.objects
  for all to authenticated
  using (bucket_id = 'artworks-original' and public.is_admin(auth.uid()))
  with check (bucket_id = 'artworks-original' and public.is_admin(auth.uid()));

-- Display bucket: no direct client read policy at all (not even
-- authenticated) — access is exclusively through the service-role client
-- inside the /api/images Route Handler, which enforces the artwork's
-- is_published flag itself before minting a signed URL or streaming bytes.
create policy "storage_display_admin_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'artworks-display' and public.is_admin(auth.uid()));

create policy "storage_display_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'artworks-display' and public.is_admin(auth.uid()))
  with check (bucket_id = 'artworks-display' and public.is_admin(auth.uid()));

create policy "storage_display_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'artworks-display' and public.is_admin(auth.uid()));

create policy "storage_thumbnail_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'artworks-thumbnail');

create policy "storage_thumbnail_admin_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'artworks-thumbnail' and public.is_admin(auth.uid()));

create policy "storage_thumbnail_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'artworks-thumbnail' and public.is_admin(auth.uid()))
  with check (bucket_id = 'artworks-thumbnail' and public.is_admin(auth.uid()));

create policy "storage_thumbnail_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'artworks-thumbnail' and public.is_admin(auth.uid()));

create policy "storage_branding_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'branding');

create policy "storage_branding_admin_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'branding' and public.is_admin(auth.uid()))
  with check (bucket_id = 'branding' and public.is_admin(auth.uid()));
