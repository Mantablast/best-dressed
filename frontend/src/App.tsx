import { useEffect, useMemo, useState, useCallback, useRef, startTransition } from 'react';
import axios from 'axios';
import FilterPanel from './components/FilterPanel';
import DressList from './components/DressList';

type Dress = {
  id: number;
  name: string;
  image_path: string;
  silhouette: string;
  shipin48hrs: boolean;
  neckline: string;
  strapsleevelayout: string;
  length: string;
  collection: string;
  fabric: string;
  color: string;
  backstyle: string;
  price: number;
  size_range: string;
  tags: string[];
  weddingvenue: string[];
  season: string;
  embellishments: string[];
  features: string[];
  has_pockets: boolean;
  corset_back: boolean;
};

type Filters = {
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
};

// --- Lifted ordering state lives here ---
const DEFAULT_SECTION_ORDER = [
  'Color', 'Silhouette', 'Neckline', 'Length', 'Fabric',
  'Backstyle', 'Tags', 'Embellishments', 'Features',
  'Collection', 'Season', 'Price',
];

export default function App() {
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [filters, setFilters] = useState<Filters>({
    color: [],
    silhouette: [],
    neckline: [],
    length: [],
    fabric: [],
    backstyle: [],
    tags: [],
    embellishments: [],
    features: [],
    collection: [],
    season: [],
    shipin48hrs: "",
    has_pockets: "",
    corset_back: "",
    price: [],
  });

  // New: ordering state owned by App (so FilterPanel won't push to parent)
  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_SECTION_ORDER);
  const [selectedOrder, setSelectedOrder] = useState<Record<string, string[]>>({});

  const norm = (v: string) => v?.trim().toLowerCase();

  // Compute priority scores here, from lifted state
  const priorityScores = useMemo(() => {
    const scores: Record<string, number> = {};
    const baseSectionWeight = 100;

    sectionOrder.forEach((section, sectionIndex) => {
      const sectionWeight = baseSectionWeight - sectionIndex * 10;
      const fieldKey = section.toLowerCase();
      const selectedItems = selectedOrder[fieldKey] || [];
      selectedItems.forEach((item, itemIndex) => {
        const itemWeight = sectionWeight - itemIndex;
        scores[`${fieldKey}:${norm(item)}`] = itemWeight;
      });
    });

    return scores;
  }, [sectionOrder, selectedOrder]);

  const fetchDresses = useCallback(() => {
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((val) => { if (val) searchParams.append(key, val); });
      } else if (value !== '') {
        searchParams.append(key, value);
      }
    });

    axios
      .get(`http://127.0.0.1:5050/api/dresses?${searchParams.toString()}`)
      .then((res) => setDresses(res.data))
      .catch((err) => console.error('Error fetching dresses:', err));
  }, [filters]);

  useEffect(() => { fetchDresses(); }, [fetchDresses]);

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h3 className="font-bold mb-4">Best Dressed - Priority Search Concept</h3>
        <p style={{ maxWidth: "800px", margin: "0 auto" }}>
          A search filter proof of concept that allows users to choose and sort filter
          items by priority to have the closest priority match displayed to them with
          a real-time priority score. It aids the user with their decision making, making a basic
          filter search a much more customized experience.
          Update Sep 13, 2025:  I have just recently learned that this concept is called
          lexicographic ordering. 
        </p>
      </div>

      <div className="min-h-screen bg-mauve-50 p-8 flex gap-8">
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          // pass ordering state down (no callbacks that set App from child)
          sectionOrder={sectionOrder}
          setSectionOrder={setSectionOrder}
          selectedOrder={selectedOrder}
          setSelectedOrder={setSelectedOrder}
        />
        <DressList
  dresses={dresses}
  priorityScores={priorityScores}
  sectionOrder={sectionOrder}
  selectedOrder={selectedOrder}
/>
      </div>

      <div className="text-center mt-8">
        <h3 className="font-bold mb-4 center">
          Made with love, sweat, frustration, bugs and many snacks. 🍅{' '}
          <a href="https://github.com/Mantablast" target="_blank" rel="noopener noreferrer">-Aimee J</a>
        </h3>
      </div>
    </div>
  );
}
