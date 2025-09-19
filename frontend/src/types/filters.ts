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
  has_pockets: string;
  corset_back: string;
  shipin48hrs: string;
  price: string[];
  priceMin?: number | null;
  priceMax?: number | null;
  [key: string]: string[] | string | number | boolean | null | undefined;
}
