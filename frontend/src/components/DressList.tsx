import { useMemo } from 'react';

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

type Props = {
  dresses: Dress[];
  priorityScores: Record<string, number>;
  sectionOrder?: string[];
  selectedOrder?: Record<string, string[]>;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
};

// Loading if no dresses populate right away
const DressList = ({
  dresses,
  priorityScores,
  sectionOrder = [],
  selectedOrder = {},
  isLoading = false,
  error = null,
  onRetry,
}: Props) => {
  if (isLoading) {
    return (
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-4">Results</h2>
        <div className="grid gap-6">

          <div className="text-sm text-black/70 animate-pulse">Connecting to server… (waking backend)</div>
        </div>
      </div>
    );
  }
  if (isLoading) {
    return <p className="text-sm text-black/70 animate-pulse">Connecting to server… (waking backend)</p>;
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
        <p className="text-sm text-red-200">Having trouble reaching the server.</p>
        {onRetry && <button onClick={onRetry} className="mt-3 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm">Try again</button>}
      </div>
    );
  }

  if (!dresses.length) return <p className="text-gray-500">No dresses found.</p>;

  // Helpers
  const norm = (v: unknown) =>
    typeof v === 'string' ? v.trim().toLowerCase() : String(v);

  const priceBucket = (p: number) =>
    p < 500 ? '0-500'
      : p < 1000 ? '500-1000'
      : p < 1500 ? '1000-1500'
      : p < 2000 ? '1500-2000'
      : '2000+';

  const fmtCurrency = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0
  });

  const IMG_BASE =
    (import.meta as any)?.env?.VITE_IMG_BASE_URL ?? 'http://localhost:5050';

  // Build normalized key set for a dress
  const keysForDress = (d: Dress): Set<string> => {
    const s = new Set<string>();
    const add = (key: string, val: string | string[] | boolean | undefined) => {
      if (Array.isArray(val)) {
        val.forEach((v: string) => s.add(`${key}:${norm(v)}`));
      } else if (typeof val === 'boolean') {
        if (val) s.add(`${key}:${norm(true)}`);
      } else if (typeof val === 'string' && val) {
        s.add(`${key}:${norm(val)}`);
      }
    };
    add('color', d.color);
    add('silhouette', d.silhouette);
    add('neckline', d.neckline);
    add('length', d.length);
    add('fabric', d.fabric);
    add('backstyle', d.backstyle);
    add('collection', d.collection);
    add('season', d.season);

    add('tags', d.tags ?? []);
    add('embellishments', d.embellishments ?? []);
    add('features', d.features ?? []);
    add('weddingvenue', d.weddingvenue ?? []);

    add('has_pockets', d.has_pockets);
    add('corset_back', d.corset_back);
    add('shipin48hrs', d.shipin48hrs);

    add('price', priceBucket(d.price));
    return s;
  };

  const sortedDresses = useMemo(() => {
    const safeSectionOrder = Array.isArray(sectionOrder) ? sectionOrder : [];
    const safeSelectedOrder: Record<string, string[]> =
      selectedOrder && typeof selectedOrder === 'object' ? selectedOrder : {};

    const withMeta = dresses.map((d: Dress) => {
      const keyset = keysForDress(d);

      // Additive score (still useful as micro tiebreaker)
      let score = 0;
      keyset.forEach((k: string) => {
        const pts = priorityScores[k];
        if (pts) score += pts;
      });

      // Lexicographic vector
      const NO_MATCH = 1e9;
      const vector = safeSectionOrder.map((section: string) => {
        const fieldKey = section.toLowerCase();
        const items = safeSelectedOrder[fieldKey] ?? [];
        let best = NO_MATCH;
        for (let j = 0; j < items.length; j++) {
          const key = `${fieldKey}:${norm(items[j])}`;
          if (keyset.has(key)) { best = j; break; }
        }
        return best;
      });

      // Dominance-weighted score mirrors lexicographic order
      const S = safeSectionOrder.length || 1;
      let dominance = 0;
      for (let i = 0; i < S; i++) {
        const j = vector[i];
        if (j !== NO_MATCH) {
          const weight = Math.pow(100, (S - i));   // higher section dominates
          dominance += (100 - j) * weight;         // earlier item within section
        }
      }

      const finalScore = dominance + score; // additive is a small tail
      return { ...d, score, vector, finalScore };
    });

    // Sort by finalScore (desc), then price asc, then name
    return withMeta.sort((a, b) =>
      (b.finalScore - a.finalScore) ||
      (a.price - b.price) ||
      a.name.localeCompare(b.name)
    );
  }, [dresses, priorityScores, sectionOrder, selectedOrder]);

  const hasPriorities =
    !!selectedOrder &&
    Object.values(selectedOrder).some((arr: unknown) => Array.isArray(arr) && (arr as unknown[]).length > 0);

  const topScore = sortedDresses.length ? (sortedDresses[0] as any).finalScore : 0;

  return (
    <div className="flex-1">
      <h2 className="text-2xl font-bold mb-4">Results</h2>
      <div className="grid gap-6">
        {sortedDresses.map((dress: Dress) => (
          <div
            key={dress.id}
            className="flex bg-mauve-50 border border-mauve-200 rounded-2xl shadow p-6 transition hover:shadow-md"
          >
            {/* Left: Text Content */}
            <div className="flex-1 pr-6">
              <h3 className="text-xl font-semibold text-mauve-900 mb-2">
                {dress.name}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-mauve-800">
                <p><strong>Silhouette:</strong> {dress.silhouette}</p>
                <p><strong>Ships in 48hrs:</strong> {dress.shipin48hrs ? "Yes" : "No"}</p>
                <p><strong>Neckline:</strong> {dress.neckline}</p>
                <p><strong>Sleeves:</strong> {dress.strapsleevelayout}</p>
                <p><strong>Length:</strong> {dress.length}</p>
                <p><strong>Collection:</strong> {dress.collection}</p>
                <p><strong>Fabric:</strong> {dress.fabric}</p>
                <p><strong>Color:</strong> {dress.color}</p>
                <p><strong>Back Style:</strong> {dress.backstyle}</p>
                <p><strong>Price:</strong> {fmtCurrency.format(dress.price)}</p>
                <p><strong>Size Range:</strong> {dress.size_range}</p>
                <p><strong>Season:</strong> {dress.season}</p>
                <p><strong>Pockets:</strong> {dress.has_pockets ? "Yes" : "No"}</p>
                <p><strong>Corset Back:</strong> {dress.corset_back ? "Yes" : "No"}</p>
              </div>

              {/* Tags, Venue, Embellishments, Features */}
              <div className="mt-4 space-y-2">
                {!!(dress.tags && dress.tags.length) && (
                  <div>
                    <strong>Tags:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(dress.tags ?? []).map((tag: string, idx: number) => (
                        <span key={idx} className="bg-mauve-100 text-mauve-800 px-2 py-1 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!!(dress.weddingvenue && dress.weddingvenue.length) && (
                  <div>
                    <strong>Venue:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(dress.weddingvenue ?? []).map((venue: string, idx: number) => (
                        <span key={idx} className="bg-mauve-100 text-mauve-800 px-2 py-1 rounded-full text-xs">
                          {venue}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!!(dress.embellishments && dress.embellishments.length) && (
                  <div>
                    <strong>Embellishments:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(dress.embellishments ?? []).map((emb: string, idx: number) => (
                        <span key={idx} className="bg-mauve-100 text-mauve-800 px-2 py-1 rounded-full text-xs">
                          {emb}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!!(dress.features && dress.features.length) && (
                  <div>
                    <strong>Features:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(dress.features ?? []).map((feat: string, idx: number) => (
                        <span key={idx} className="bg-mauve-100 text-mauve-800 px-2 py-1 rounded-full text-xs">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Image */}
            <div className="w-1/3 flex flex-col items-center justify-center">
              <div className="mb-2 text-mauve-900 text-lg font-bold">
                {(() => {
                  // If there are no priorities selected, don't pretend rank exists
                  if (!hasPriorities || topScore <= 0) {
                    return "Match Score: —";
                  }

                  const isTop = (dress as any).finalScore === topScore;

                  // floor to avoid accidental 100% on non-top items; cap non-top at 99
                  const rawPct = Math.floor(((dress as any).finalScore / topScore) * 100);
                  const pct = isTop ? 100 : Math.min(99, Math.max(1, rawPct)); // ensure at least 1%

                  if (isTop) {
                    return "Priority Pick";
                  } else if (pct >= 90) {
                    return `Strong Match: ${pct}%`;
                  } else if (pct >= 80) {
                    return `Close Match: ${pct}%`;
                  } else {
                    return `Match Score: ${pct}%`;
                  }
                })()}
              </div>

              <img
                src={`${IMG_BASE}${dress.image_path}`}
                alt={dress.name}
                className="max-h-80 object-contain rounded-xl bg-white"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DressList;
