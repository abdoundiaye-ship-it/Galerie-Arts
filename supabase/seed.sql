-- Base reference data. Run automatically by `supabase db reset`.
-- Real artwork rows are inserted by scripts/convert-artworks.mjs, not here,
-- because they require uploading the converted image files to Storage first.

insert into public.categories (name, slug, description) values
  ('Peinture', 'peinture', 'Oeuvres peintes (acrylique, huile, mixte)'),
  ('Ceramique', 'ceramique', 'Pieces en ceramique et sculpture')
on conflict (slug) do nothing;

insert into public.collections (name, slug, description) values
  ('Maitres Senegalais', 'maitres-senegalais', 'Collection reunissant des artistes senegalais reconnus')
on conflict (slug) do nothing;

-- To promote the first administrator after they sign up through the app,
-- run (replace the email):
--
--   update public.profiles
--   set role_id = (select id from public.roles where name = 'admin'),
--       status = 'admin'
--   where id = (select id from auth.users where email = 'admin@example.com');
