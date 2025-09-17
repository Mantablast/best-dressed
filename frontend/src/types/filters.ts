export type Multi = string[];

export interface Filters {
  color: Multi;
  silhouette: Multi;
  neckline: Multi;
  length: Multi;
  fabric: Multi;
  backstyle: Multi;
  collection: Multi;
  season: Multi;
  tags: Multi;
  embellishments: Multi;
  features: Multi;
  sleeves: Multi;
  has_pockets: boolean | null;
  corset_back: boolean | null;
  shipin48hrs: boolean | null;
  priceMin: number | null;
  priceMax: number | null;
}
