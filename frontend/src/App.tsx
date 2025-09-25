import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import FilterPanel from './components/FilterPanel';
import DressList from './components/DressList';
import type { Filters } from "./types/filters";

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


// --- Lifted ordering state lives here ---
const DEFAULT_SECTION_ORDER = [
  'Color', 'Silhouette', 'Neckline', 'Length', 'Fabric',
  'Backstyle', 'Tags', 'Embellishments', 'Features',
  'Collection', 'Season', 'Price',
];

export default function App() {
  const [dresses, setDresses] = useState<Dress[] | null>(null); // null = not loaded yet
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [filters, setFilters] = useState<Filters>({
    color: [], silhouette: [], neckline: [], length: [], fabric: [],
    backstyle: [], tags: [], embellishments: [], features: [],
    collection: [], season: [], shipin48hrs: '', has_pockets: '',
    corset_back: '', price: [],
  });

  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_SECTION_ORDER);
  const [selectedOrder, setSelectedOrder] = useState<Record<string, string[]>>({});

  const norm = (v: string) => v?.trim().toLowerCase();

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

  // --- helper: exponential backoff with jitter ---
  async function fetchWithRetry(url: string, signal: AbortSignal, maxAttempts = 7, baseDelay = 600) {
    let attempt = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      attempt++;
      try {
        const res = await fetch(url, { signal, headers: { accept: "application/json" } });
        if (!res.ok) {
          // retry only on transient statuses
          if ([500,502,503,504,522,524,429].includes(res.status)) throw new Error(`Retryable ${res.status}`);
          const text = await res.text().catch(() => "");
          const e = new Error(`HTTP ${res.status} ${res.statusText} ${text}`.trim());
          // non-retryable
          (e as any).nonRetryable = true;
          throw e;
        }
        return await res.json();
      } catch (e: any) {
        if (signal.aborted || e?.nonRetryable || attempt >= maxAttempts) throw e;
        const jitter = Math.random() * 0.25 + 0.9; // 0.9–1.15x
        const delay = Math.floor(baseDelay * Math.pow(1.75, attempt - 1) * jitter);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  const fetchDresses = useCallback(async () => {
    // build query from your filters (same logic you had)
    const searchParams = new URLSearchParams();
    Object.entries(filters as Record<string, unknown>).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        for (const v of value) {
          if (v != null && String(v).trim() !== '') searchParams.append(key, String(v));
        }
      } else if (value != null && String(value).trim() !== '') {
        searchParams.append(key, String(value));
      }
    });

    const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:5050';
    const url = `${API_BASE}/api/dresses?${searchParams.toString()}`;

    // cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchWithRetry(url, controller.signal, 7, 600);
      setDresses(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e);
      setDresses([]); // keep stable shape
      console.error('Error fetching dresses:', e);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDresses();
    return () => abortRef.current?.abort();
  }, [fetchDresses]);

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h3 className="font-bold mb-4">Best Dressed - Priority Search Concept</h3>
        <p style={{ maxWidth: "800px", margin: "0 auto" }}>
          A search filter proof of concept that allows users to choose and sort
          filter items by priority to have the closest priority match displayed
          to them with a real-time priority score. It aids the user with their
          decision making, making a basic filter search a much more customized
          experience. Update Sep 13, 2025: I have just recently learned that
          this concept is called lexicographic ordering.
        </p>
      </div>

      <div className="min-h-screen bg-mauve-50 p-8 flex gap-8">
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          sectionOrder={sectionOrder}
          setSectionOrder={setSectionOrder}
          selectedOrder={selectedOrder}
          setSelectedOrder={setSelectedOrder}
        />

        {/* Loading & errors are handled here and passed down */}
        <DressList
          dresses={Array.isArray(dresses) ? dresses : []}
          isLoading={isLoading || dresses === null}
          error={error}
          onRetry={fetchDresses}
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
