// src/types/filters.ts
export interface Filters {
  color: string[];
  silhouette: string[];
  neckline: string[];
  length: string[];
  fabric: string[];
  backstyle: string[];
  tags: string[];
  embellishments: string[];
  features: string[];
  collection: string[];
  season: string[];
  // your current app uses string flags: '' | 'true' | 'false'
  has_pockets: string;
  corset_back: string;
  shipin48hrs: string;
  price: string[];

  // (optional) keep these for later if you add numeric ranges
  priceMin?: number | null;
  priceMax?: number | null;

  // allow safe dynamic indexing (so prev[field] works)
  [key: string]: string[] | string | number | boolean | null | undefined;
}
