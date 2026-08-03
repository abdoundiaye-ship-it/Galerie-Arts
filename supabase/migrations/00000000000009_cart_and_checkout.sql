-- Multi-artwork cart: visitors add pieces while browsing, then check out
-- once. Checkout fans the cart out into one purchase_requests row per
-- artwork (reusing the existing single-item review/accept/refuse flow
-- admins already have), tagged with a shared checkout_group_id so the
-- admin UI can present them as one order rather than N unrelated
-- requests. No payment processing here — checkout still ends in a
-- manually-reviewed request, matching the documented roadmap (online
-- payment is a later phase; see docs/ROADMAP.md).

create table public.cart_items (
  user_id uuid not null references public.profiles (id) on delete cascade,
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (user_id, artwork_id)
);

create index cart_items_artwork_id_idx on public.cart_items (artwork_id);

alter table public.cart_items enable row level security;

create policy "cart_items_owner_all" on public.cart_items
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table public.purchase_requests add column checkout_group_id uuid;

create index purchase_requests_checkout_group_id_idx on public.purchase_requests (checkout_group_id);
