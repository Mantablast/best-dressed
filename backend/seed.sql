-- === 1) TABLE ===
create table if not exists public.dresses (
  id               bigserial primary key,
  name             text not null,
  image_path       text,                         -- e.g. /images/123.jpg or a full URL
  silhouette       text,
  shipin48hrs      boolean default false,
  neckline         text,
  strapsleevelayout text,
  length           text,
  collection       text,
  fabric           text,
  color            text,
  backstyle        text,
  price            numeric(10,2),                -- price in your currency
  size_range       text,                         -- e.g. "0-24"
  tags             text[] default '{}',
  weddingvenue     text[] default '{}',
  season           text,
  embellishments   text[] default '{}',
  features         text[] default '{}',
  has_pockets      boolean default false,
  corset_back      boolean default false,

  created_at       timestamptz not null default now()
);

comment on table public.dresses is 'Best-Dressed catalog items';
comment on column public.dresses.weddingvenue is 'e.g. ["beach","garden","ballroom"]';

-- === 2) INDEXES (speed up filters) ===
-- Simple btree indexes for common equality filters
create index if not exists idx_dresses_silhouette on public.dresses (silhouette);
create index if not exists idx_dresses_neckline   on public.dresses (neckline);
create index if not exists idx_dresses_length     on public.dresses (length);
create index if not exists idx_dresses_fabric     on public.dresses (fabric);
create index if not exists idx_dresses_color      on public.dresses (color);
create index if not exists idx_dresses_collection on public.dresses (collection);
create index if not exists idx_dresses_season     on public.dresses (season);
create index if not exists idx_dresses_backstyle  on public.dresses (backstyle);
create index if not exists idx_dresses_shipin48   on public.dresses (shipin48hrs);
create index if not exists idx_dresses_has_pockets on public.dresses (has_pockets);
create index if not exists idx_dresses_corset_back on public.dresses (corset_back);
create index if not exists idx_dresses_price on public.dresses (price);

-- GIN indexes for array columns (for @> queries)
create index if not exists idx_dresses_tags_gin           on public.dresses using gin (tags);
create index if not exists idx_dresses_venue_gin          on public.dresses using gin (weddingvenue);
create index if not exists idx_dresses_embellishments_gin on public.dresses using gin (embellishments);
create index if not exists idx_dresses_features_gin       on public.dresses using gin (features);

-- Optional: fuzzy search on name (requires pg_trgm extension)
create extension if not exists pg_trgm;
create index if not exists idx_dresses_name_trgm on public.dresses using gin (name gin_trgm_ops);

-- === 3) SEED DATA (sample rows) ===
insert into public.dresses
  (name, image_path, silhouette, shipin48hrs, neckline, strapsleevelayout, length,
   collection, fabric, color, backstyle, price, size_range, tags, weddingvenue, season,
   embellishments, features, has_pockets, corset_back)
values
  ('Luna A-Line', '/images/luna.jpg', 'A-line', true, 'Sweetheart', 'straps', 'Floor Length',
   'Modern Muse', 'Tulle', 'Ivory', 'Corset Back', 1299.00, '0-24',
   array['elegant','minimal'], array['garden','ballroom'], 'spring',
   array['beading'], array['built-in bra','easy bustle'], true, true),

  ('Midnight Bloom Mermaid', '/images/midnight.jpg', 'Mermaid', false, 'V-neck', 'sleeveless', 'Chapel Train',
   'Midnight Bloom', 'Satin', 'Black', 'Zipper + Buttons', 1899.00, '0-20',
   array['dramatic','modern'], array['ballroom'], 'fall',
   array['sequins','pearls'], array['convertible'], false, false),

  ('Rose Reverie Ballgown', '/images/rose.jpg', 'Ballgown', true, 'Off-the-Shoulder', 'sleeves', 'Cathedral Train',
   'Rose Reverie', 'Organza', 'Blush', 'Corset Back', 2499.00, '2-28',
   array['princess','lace'], array['garden','cathedral'], 'summer',
   array['floral appliqué','embroidery'], array['stay-in-place straps'], false, true)
on conflict do nothing;
