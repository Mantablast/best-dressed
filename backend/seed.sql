-- =========================
-- SCHEMA: dresses
-- =========================
create table if not exists public.dresses (
  id                bigserial primary key,
  name              text not null,
  image_path        text,
  silhouette        text,
  shipin48hrs       boolean,
  neckline          text,
  strapsleevelayout text,
  length            text,
  collection        text,
  fabric            text,
  color             text,
  backstyle         text,
  price             numeric(10,2),
  size_range        text,
  tags              text[] default '{}',
  weddingvenue      text[] default '{}',
  season            text,
  embellishments    text[] default '{}',
  features          text[] default '{}',
  has_pockets       boolean default false,
  corset_back       boolean default false,
  created_at        timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_dresses_silhouette  on public.dresses (silhouette);
create index if not exists idx_dresses_neckline    on public.dresses (neckline);
create index if not exists idx_dresses_length      on public.dresses (length);
create index if not exists idx_dresses_collection  on public.dresses (collection);
create index if not exists idx_dresses_fabric      on public.dresses (fabric);
create index if not exists idx_dresses_color       on public.dresses (color);
create index if not exists idx_dresses_backstyle   on public.dresses (backstyle);
create index if not exists idx_dresses_shipin48    on public.dresses (shipin48hrs);
create index if not exists idx_dresses_pockets     on public.dresses (has_pockets);
create index if not exists idx_dresses_corset      on public.dresses (corset_back);
create index if not exists idx_dresses_price       on public.dresses (price);

-- Array indexes (for tags/venues/etc.)
create index if not exists idx_dresses_tags_gin           on public.dresses using gin (tags);
create index if not exists idx_dresses_venue_gin          on public.dresses using gin (weddingvenue);
create index if not exists idx_dresses_embellishments_gin on public.dresses using gin (embellishments);
create index if not exists idx_dresses_features_gin       on public.dresses using gin (features);

-- Optional fuzzy search on name
create extension if not exists pg_trgm;
create index if not exists idx_dresses_name_trgm on public.dresses using gin (name gin_trgm_ops);

-- =========================
-- DATA: 10 dresses from seed.py
-- (has_pockets inferred from features; corset_back from backstyle or features)
-- =========================
insert into public.dresses
  (name, image_path, silhouette, shipin48hrs, neckline, strapsleevelayout, length,
   collection, fabric, color, backstyle, price, size_range, tags, weddingvenue, season,
   embellishments, features, has_pockets, corset_back)
values
  -- 1
  ('Celestial Lace', '1.png', 'A-line', true, 'V-neck', 'Straps', 'Floor Length',
   'Golden Hour', 'Lace', 'Ivory', 'Zip-up back', 1500.00, '2-18',
   array['elegant','vintage','lace'], array['beach','garden'], 'spring',
   array['beading','embroidery'],
   array['pockets','zip-up back','convertible','Stay-in-place straps'],
   true, false),

  -- 2
  ('Midnight Tulle', '2.png', 'Ballgown', false, 'Off-the-Shoulder', 'Straps', 'Floor Length',
   'Midnight Bloom', 'Tulle', 'Black', 'Zipper', 2800.00, '4-22',
   array['dramatic','princess','twilight'], array['ballroom','cathedral'], 'winter',
   array['sequins','beading'],
   array['removable train','built-in bra'],
   false, false),

  -- 3
  ('Satin Whisper', '3.png', 'Sheath', true, 'Straight Across', 'Straps', 'Chapel Train',
   'Modern Muse', 'Satin', 'White', 'Keyhole Back', 1200.00, '0-12',
   array['minimal','modern','sleek'], array['rooftop','courthouse'], 'summer',
   array['none'],
   array['4-way stretch','adjustable straps'],
   false, false),

  -- 4
  ('Garden Muse', '4.png', 'Fit-and-Flare', false, 'V-neck', 'Bell', 'Floor Length',
   'Botanical Romance', 'Chiffon', 'Blush', 'Illusion Back', 1750.00, '6-16',
   array['boho','romantic','whimsical'], array['garden','vineyard'], 'spring',
   array['floral appliqué','lace'],
   array['eco-friendly fabric','lightweight'],
   false, false),

  -- 5
  ('Moonlight Veil', '5.png', 'Mermaid', true, 'V-neck', 'Straps', 'Chapel Train',
   'Moonlight Collection', 'Organza', 'Ivory', 'Corset Back', 3200.00, '2-14',
   array['glamorous','bold','curve-hugging'], array['hotel','evening'], 'fall',
   array['pearls','crystals'],
   array['corset back','sweeping train','shimmer finish'],
   false, true),

  -- 6
  ('Golden Hour', '6.png', 'A-line', false, 'Sweetheart', 'Strapless', 'Floor Length',
   'Golden Hour', 'Tulle', 'Champagne', 'Lace-Up', 2500.00, '0-20',
   array['romantic','dreamy','soft'], array['garden','terrace'], 'summer',
   array['glitter tulle','lace overlay'],
   array['pockets','convertible straps','lightweight skirt'],
   true, false),

  -- 7
  ('Whispering Rose', '7.png', 'Ballgown', true, 'Sweetheart', 'Cap Sleeves', 'Cathedral Train',
   'Rose Reverie', 'Lace', 'Blush', 'Zipper + Buttons', 3100.00, '4-18',
   array['romantic','floral','classic'], array['garden','chapel'], 'spring',
   array['floral embroidery','beading'],
   array['illusion neckline','full skirt','pockets'],
   true, false),

  -- 8
  ('Ocean Pearl', '8.png', 'Sheath', false, 'Straight Across', 'Straps', 'Knee Length',
   'Seaside Glow', 'Satin', 'White', 'Low Back', 1100.00, '2-10',
   array['simple','beach','classic'], array['beach','cruise'], 'summer',
   array['pearls','subtle beading'],
   array['built-in support','anti-wrinkle fabric'],
   false, false),

  -- 9
  ('Crystal Breeze', '9.png', 'A-line', true, 'Off-the-Shoulder', 'Strapless', 'Chapel Train',
   'Crystal Dream', 'Organza', 'Ivory', 'Corset Back', 1400.00, '6-16',
   array['whimsical','airy','light'], array['mountain','outdoor'], 'fall',
   array['shimmer organza','anti-wrinkle'],
   array['corset back','airy layers','easy bustle','pockets'],
   true, true),

  -- 10
  ('Twilight Mist', '10.png', 'Fit-and-Flare', false, 'High Neck', 'Shoulder', 'Sweep Train',
   'Twilight Muse', 'Chiffon', 'White', 'Illusion Back', 2700.00, '0-14',
   array['modern','elegant','refined'], array['indoor','loft'], 'winter',
   array['lace','beading'],
   array['illusion neckline','fitted bodice','comfortable lining'],
   false, false);
