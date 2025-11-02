import { useCallback, useEffect, useRef, useState } from "react";
import FilterPanel from "./components/FilterPanel";
import DressList from "./components/DressList";
import type { Filters } from "./types/filters";
import { buildPriorityPayload } from "./utils/buildPriorityPayload";

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
  score?: number;
  _debug?: Record<string, unknown>;
};

type PageInfo = {
  limit: number;
  offset: number;
  returned: number;
  total: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

type DressSearchResponse = {
  items: Dress[];
  total_count: number;
  pageInfo: PageInfo;
  debug?: Record<string, unknown>;
};

type RetryOpts = { maxAttempts?: number; baseDelay?: number };

const DEFAULT_SECTION_ORDER = [
  "Color",
  "Silhouette",
  "Neckline",
  "Length",
  "Fabric",
  "Backstyle",
  "Tags",
  "Embellishments",
  "Features",
  "Collection",
  "Season",
  "Price",
];

const PAGE_SIZE = 24;
const DEBUG_SCORING = (import.meta as any)?.env?.VITE_DEBUG_SCORING === "true";
const BACKGROUND_URL = "/assets/bg.png";

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  { maxAttempts = 6, baseDelay = 350 }: RetryOpts = {}
) {
  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt++;
    try {
      const response = await fetch(url, init);
      if (!response.ok) {
        if ([500, 502, 503, 504, 522, 524, 429].includes(response.status)) {
          throw new Error(`Retryable ${response.status}`);
        }
        const text = await response.text().catch(() => "");
        const error: any = new Error(`HTTP ${response.status} ${response.statusText} ${text}`.trim());
        error.nonRetryable = true;
        throw error;
      }
      return (await response.json()) as DressSearchResponse;
    } catch (error: any) {
      const signal = init.signal as AbortSignal | undefined;
      if (signal?.aborted || error?.nonRetryable || attempt >= maxAttempts) throw error;
      const jitter = Math.random() * 0.25 + 0.9; // 0.9–1.15x
      const delay = Math.floor(baseDelay * Math.pow(1.75, attempt - 1) * jitter);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Unable to complete request");
}

const API_BASE = (import.meta as any)?.env?.VITE_API_BASE ?? "http://127.0.0.1:5050";

export default function App() {
  const [results, setResults] = useState<DressSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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

  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_SECTION_ORDER);
  const [selectedOrder, setSelectedOrder] = useState<Record<string, string[]>>({});

  const fetchDresses = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const priority = buildPriorityPayload(sectionOrder, selectedOrder);
    const payload = {
      filters,
      priority,
      page: { limit: PAGE_SIZE, offset: 0 },
      debug: DEBUG_SCORING,
    };

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchWithRetry(
        `${API_BASE}/api/dresses`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        },
        { maxAttempts: 6, baseDelay: 350 }
      );

      const normalized: DressSearchResponse = {
        items: Array.isArray(data?.items) ? data.items : [],
        total_count: typeof data?.total_count === "number" ? data.total_count : 0,
        pageInfo: {
          limit: data?.pageInfo?.limit ?? PAGE_SIZE,
          offset: data?.pageInfo?.offset ?? 0,
          returned: data?.pageInfo?.returned ?? (Array.isArray(data?.items) ? data.items.length : 0),
          total: data?.pageInfo?.total ?? (typeof data?.total_count === "number" ? data.total_count : 0),
          hasNextPage: Boolean(data?.pageInfo?.hasNextPage),
          hasPrevPage: Boolean(data?.pageInfo?.hasPrevPage),
        },
        debug: data?.debug,
      };

      setResults(normalized);
    } catch (err: any) {
      if (!(controller.signal?.aborted)) {
        setError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters, sectionOrder, selectedOrder]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchDresses().catch((err) => {
        console.error("Priority search failed:", err);
      });
    }, 280);
    return () => {
      window.clearTimeout(timer);
    };
  }, [fetchDresses]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const dresses = results?.items ?? [];

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${BACKGROUND_URL})` }}
    >
      <div className="min-h-screen bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10 lg:px-10">
          <header className="text-center mb-10">
            <h3 className="font-bold mb-4 text-2xl text-mauve-900">Best Dressed - Priority Search Concept</h3>
            <p className="mx-auto max-w-3xl text-sm text-mauve-800">
              A search filter proof of concept that allows users to choose and sort filter items by priority to have
              the closest priority match displayed to them with a real-time priority score. It aids the user with their
              decision making, making a basic filter search a much more customized experience.
            </p>
          </header>

          <main className="flex-1 rounded-3xl border border-white/40 bg-mauve-50/85 p-6 shadow-2xl backdrop-blur-sm lg:p-8">
            <div className="flex flex-col gap-8 lg:flex-row">
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                sectionOrder={sectionOrder}
                setSectionOrder={setSectionOrder}
                selectedOrder={selectedOrder}
                setSelectedOrder={setSelectedOrder}
              />

              <DressList
                dresses={dresses}
                totalCount={results?.total_count ?? 0}
                pageInfo={results?.pageInfo}
                debugMeta={results?.debug}
                sectionOrder={sectionOrder}
                selectedOrder={selectedOrder}
                isLoading={isLoading && dresses.length === 0}
                error={error}
                onRetry={fetchDresses}
              />
            </div>
          </main>

          <footer className="text-center mt-8 text-mauve-800">
            <h3 className="font-bold mb-4">
              Made with love, sweat, frustration, bugs and many snacks. 🍅{" "}
              <a href="https://github.com/Mantablast" target="_blank" rel="noopener noreferrer" className="underline decoration-dashed">
                -Aimee J
              </a>
            </h3>
          </footer>
        </div>
      </div>
    </div>
  );
}
