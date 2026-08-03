create table public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, artwork_id)
);

create index favorites_artwork_id_idx on public.favorites (artwork_id);

create type public.purchase_request_status as enum (
  'en_attente',
  'acceptee',
  'refusee',
  'annulee'
);

create table public.purchase_requests (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  message text,
  proposed_price numeric(12, 2) check (proposed_price is null or proposed_price >= 0),
  status public.purchase_request_status not null default 'en_attente',
  admin_response text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index purchase_requests_artwork_id_idx on public.purchase_requests (artwork_id);
create index purchase_requests_user_id_idx on public.purchase_requests (user_id);
create index purchase_requests_status_idx on public.purchase_requests (status);

create trigger purchase_requests_set_updated_at
  before update on public.purchase_requests
  for each row execute function public.set_updated_at();

-- Architecture-ready for a future payment integration; not exercised by
-- any UI flow in this build (per project roadmap: online payment is a
-- later phase). The stripe_payment_intent_id column anticipates that
-- integration without requiring a later migration to add it.
create type public.order_status as enum ('pending', 'paid', 'cancelled', 'refunded');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  purchase_request_id uuid references public.purchase_requests (id) on delete set null,
  artwork_id uuid not null references public.artworks (id) on delete restrict,
  user_id uuid not null references public.profiles (id) on delete restrict,
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null default 'XOF',
  status public.order_status not null default 'pending',
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_artwork_id_idx on public.orders (artwork_id);
create index orders_user_id_idx on public.orders (user_id);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.favorites enable row level security;
alter table public.purchase_requests enable row level security;
alter table public.orders enable row level security;
