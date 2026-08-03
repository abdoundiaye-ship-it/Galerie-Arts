create type public.artwork_availability as enum ('disponible', 'reserve', 'vendu');

create table public.artworks (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  title text not null,
  author text not null,
  technique text,
  dimensions text,
  year smallint check (year is null or (year between 1400 and extract(year from now())::smallint + 1)),
  description text,
  price numeric(12, 2) check (price is null or price >= 0),
  currency text not null default 'XOF',
  availability public.artwork_availability not null default 'disponible',
  category_id uuid references public.categories (id) on delete set null,
  collection_id uuid references public.collections (id) on delete set null,
  is_published boolean not null default false,
  is_protected boolean not null default true,
  view_count integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index artworks_category_id_idx on public.artworks (category_id);
create index artworks_collection_id_idx on public.artworks (collection_id);
create index artworks_availability_idx on public.artworks (availability);
create index artworks_year_idx on public.artworks (year);
create index artworks_is_published_idx on public.artworks (is_published);

-- Trigram indexes power the "keyword / author / technique" search filters.
create index artworks_title_trgm_idx on public.artworks using gin (title gin_trgm_ops);
create index artworks_author_trgm_idx on public.artworks using gin (author gin_trgm_ops);
create index artworks_technique_trgm_idx on public.artworks using gin (technique gin_trgm_ops);

create trigger artworks_set_updated_at
  before update on public.artworks
  for each row execute function public.set_updated_at();

create table public.artwork_images (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  storage_path text not null,
  display_path text not null,
  thumbnail_path text not null,
  is_primary boolean not null default false,
  sort_order smallint not null default 0,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create index artwork_images_artwork_id_idx on public.artwork_images (artwork_id);

-- Only one primary image per artwork.
create unique index artwork_images_one_primary_idx
  on public.artwork_images (artwork_id)
  where is_primary;

alter table public.artworks enable row level security;
alter table public.artwork_images enable row level security;

create or replace function public.increment_artwork_view(artwork_reference text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.artworks
  set view_count = view_count + 1
  where reference = artwork_reference and is_published = true;
$$;
