-- Base reference data. Run automatically by `supabase db reset`.
-- Real artwork rows are inserted by scripts/convert-artworks.mjs, not here,
-- because they require uploading the converted image files to Storage first.

insert into public.categories (name, slug, description) values
  ('Peinture', 'peinture', 'Oeuvres peintes (acrylique, huile, mixte, sous-verre, collage)'),
  ('Ceramique', 'ceramique', 'Pieces en ceramique'),
  ('Sculpture', 'sculpture', 'Sculptures en metal, bronze, bois, et metaux repousses'),
  ('Tapisserie', 'tapisserie', 'Tapisseries et tissages')
on conflict (slug) do nothing;

insert into public.collections (name, slug, description) values
  ('Maitres Senegalais', 'maitres-senegalais', 'Collection reunissant des artistes senegalais reconnus')
on conflict (slug) do nothing;

-- To promote the first administrator after they sign up through the app,
-- disable the anti-escalation trigger for the single update, then
-- re-enable it immediately (see docs/SECURITY.md and README.md for why
-- this dance is required):
--
--   alter table public.profiles disable trigger profiles_prevent_self_role_escalation;
--   update public.profiles
--   set role_id = (select id from public.roles where name = 'admin'),
--       is_active = true
--   where id = (select id from auth.users where email = 'admin@example.com');
--   alter table public.profiles enable trigger profiles_prevent_self_role_escalation;
