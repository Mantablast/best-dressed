import { useMemo, useState } from "react";
import type { Filters } from "@/types/filters";
import FilterPanel from "@/components/FilterPanel";
import DressList from "@/components/DressList";
import type { ComponentType } from "react";

type DressListProps = {
  items: any[]; 
};
// Single source of truth for initial filters
const INITIAL_FILTERS: Filters = {
  color: [],
  silhouette: [],
  neckline: [],
  length: [],
  fabric: [],
  backstyle: [],
  collection: [],
  season: [],
  tags: [],
  embellishments: [],
  features: [],
  sleeves: [],
  has_pockets: null,
  corset_back: null,
  shipin48hrs: null,
  priceMin: null,
  priceMax: null,
};

// Example option sets (replace with your actual options/data)
const options = {
  color: ["white", "ivory", "champagne", "blush", "black"],
  silhouette: ["A-line", "Ball Gown", "Mermaid", "Sheath", "Tea-Length"],
  neckline: ["Sweetheart", "V-neck", "Off-Shoulder", "Halter", "Square"],
  length: ["Floor", "Tea", "Knee", "Mini", "High-Low"],
  fabric: ["Lace", "Satin", "Tulle", "Organza", "Crepe"],
  backstyle: ["Open", "Illusion", "Corset", "Keyhole", "Low"],
  collection: ["Classic", "Modern", "Boho", "Fairycore", "Minimal"],
  season: ["Spring", "Summer", "Fall", "Winter", "All-Season"],
  tags: ["New", "Bestseller", "Sample", "Plus-size", "Petite"],
  embellishments: ["Beading", "Sequins", "Appliqué", "Embroidery", "Pearls"],
  features: ["Train", "Bustle-ready", "Built-in Bra", "Detachable Skirt"],
  sleeves: ["Sleeveless", "Cap", "Short", "3/4", "Long", "Detachable"],
} as const;

// TEMP sample data (replace with your real dresses + filtering logic)
type Dress = {
  id: string;
  title: string;
  price: number;
  color: string;
};
const ALL_DRESSES: Dress[] = [
  { id: "1", title: "Aurora Lace", price: 1299, color: "ivory" },
  { id: "2", title: "Midnight Tulle", price: 1799, color: "black" },
  { id: "3", title: "Champagne Bloom", price: 1499, color: "champagne" },
];

export default function App() {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);

  // Example filter: only color match + price range; replace with your real predicate
  const dresses = useMemo(() => {
    return ALL_DRESSES.filter((d) => {
      const colorOk =
        filters.color.length === 0 || filters.color.includes(d.color);
      const minOk =
        filters.priceMin == null || d.price >= Number(filters.priceMin);
      const maxOk =
        filters.priceMax == null || d.price <= Number(filters.priceMax);
      return colorOk && minOk && maxOk;
    });
  }, [filters]);
  const DressListAdapter = DressList as unknown as ComponentType<{ items: Dress[] }>;
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl p-4 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6">
        <aside className="md:col-span-4 lg:col-span-3">
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            options={options}
          />
        </aside>

        <main className="md:col-span-8 lg:col-span-9">
          <DressListAdapter items={dresses} />
        </main>
      </div>
    </div>
  );
}
