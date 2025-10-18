import { useMemo } from "react";
import { CheckCircle2 } from "lucide-react";

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

type Props = {
  dresses: Dress[];
  totalCount: number;
  pageInfo?: PageInfo;
  debugMeta?: Record<string, unknown>;
  sectionOrder?: string[];
  selectedOrder?: Record<string, string[]>;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
};

const currency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

const IMG_BASE_DEFAULT = "http://127.0.0.1:5050/static/images/";
const rawImgBase = import.meta.env.VITE_IMG_BASE_URL ?? IMG_BASE_DEFAULT;
const IMG_BASE = rawImgBase.endsWith("/") ? rawImgBase : `${rawImgBase}/`;

const VALUE_DECAY = 0.65;
const HIGH_PRIORITY_VALUE_WEIGHT_THRESHOLD = 0.5;

const normalize = (value: string) => value?.trim().toLowerCase();

const buildSelectionTokens = (
  sectionOrder: string[] = [],
  selectedOrder: Record<string, string[] | undefined> = {}
) => {
  const highPriorityTokens = new Set<string>();
  const selectedTokens = new Set<string>();
  let totalSelectedCount = 0;

  sectionOrder.forEach((section) => {
    const key = normalize(section ?? "");
    if (!key) return;
    const items = Array.isArray(selectedOrder[key]) ? (selectedOrder[key] as string[]) : [];
    items.forEach((item, index) => {
      const normalizedItem = normalize(item ?? "");
      if (!normalizedItem) return;
      const token = `${key}:${normalizedItem}`;
      selectedTokens.add(token);
       totalSelectedCount += 1;
      const valueWeight = Math.pow(VALUE_DECAY, index);
      if (valueWeight >= HIGH_PRIORITY_VALUE_WEIGHT_THRESHOLD) {
        highPriorityTokens.add(token);
      }
    });
  });

  return { selectedTokens, highPriorityTokens, totalSelectedCount };
};

const keysForDress = (dress: Dress): Set<string> => {
  const tokens = new Set<string>();
  const push = (key: string, value?: string | string[] | boolean | null) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        const normalized = normalize(item ?? "");
        if (normalized) tokens.add(`${key}:${normalized}`);
      });
      return;
    }
    if (typeof value === "boolean") {
      if (value) tokens.add(`${key}:true`);
      return;
    }
    const normalized = normalize((value ?? "") as string);
    if (normalized) tokens.add(`${key}:${normalized}`);
  };

  push("color", dress.color);
  push("silhouette", dress.silhouette);
  push("neckline", dress.neckline);
  push("length", dress.length);
  push("fabric", dress.fabric);
  push("backstyle", dress.backstyle);
  push("collection", dress.collection);
  push("season", dress.season);
  push("tags", dress.tags);
  push("embellishments", dress.embellishments);
  push("features", dress.features);
  push("weddingvenue", dress.weddingvenue);
  push("has_pockets", dress.has_pockets);
  push("corset_back", dress.corset_back);
  push("shipin48hrs", dress.shipin48hrs);

  return tokens;
};

const formatCount = (count: number) => `${count} feature${count === 1 ? "" : "s"}`;

type TooltipProps = {
  id: string;
  highPriorityMatches: number;
  totalMatches: number;
  totalSelectedCount: number;
};

const TooltipContent = ({ id, highPriorityMatches, totalMatches, totalSelectedCount }: TooltipProps) => {
  const topLabel = totalSelectedCount >= 3 ? "top 3" : `top ${Math.max(totalSelectedCount, 1)}`;

  return (
    <div
      id={id}
      role="tooltip"
      className="pointer-events-none mt-2 max-w-xs origin-top-right rounded-lg border border-emerald-200 bg-white/95 px-3 py-2 text-xs text-emerald-900 shadow-lg opacity-0 translate-y-1 transition-all duration-150 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0"
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-700">Match insight</p>
      <p className="mt-1 leading-snug">This item has <strong>{formatCount(highPriorityMatches)}</strong> in your {topLabel}.</p>
      <p className="mt-1 leading-snug">
        Overall matches: <strong>{formatCount(totalMatches)}</strong>
      </p>
    </div>
  );
};

const formatMatchBadge = (score: number | undefined, topScore: number) => {
  if (!topScore || !score) return "Match Score: —";
  if (score === topScore) return "Priority Pick";
  const pct = Math.floor((score / topScore) * 100);
  if (pct >= 90) return `Strong Match: ${pct}%`;
  if (pct >= 80) return `Close Match: ${pct}%`;
  return `Match Score: ${Math.max(1, Math.min(99, pct))}%`;
};

const DressList = ({
  dresses,
  totalCount,
  pageInfo,
  debugMeta,
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
          <div className="text-sm text-black/70 animate-pulse">Scoring dresses…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
        <p className="text-sm text-red-200">Having trouble reaching the server.</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-3 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm">
            Try again
          </button>
        )}
      </div>
    );
  }

  if (!dresses.length) {
    return (
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-4">Results</h2>
        <p className="text-gray-500">No dresses found.</p>
      </div>
    );
  }

  const selectionTokens = useMemo(
    () => buildSelectionTokens(sectionOrder, selectedOrder),
    [sectionOrder, selectedOrder]
  );
  const { selectedTokens, highPriorityTokens, totalSelectedCount } = selectionTokens;

  const topScore = dresses.reduce((max, dress) => Math.max(max, dress.score ?? 0), 0);

  return (
    <div className="flex-1">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-2xl font-bold">Results</h2>
        <div className="text-sm text-mauve-700">
          Showing {dresses.length} of {totalCount} dresses
          {pageInfo && pageInfo.hasNextPage ? " • more available" : ""}
        </div>
      </div>

      {debugMeta && (
        <details className="mb-4 rounded-lg bg-mauve-100/60 p-3 text-sm text-mauve-800">
          <summary className="cursor-pointer font-semibold">Debug scoring payload</summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words text-xs">
            {JSON.stringify(debugMeta, null, 2)}
          </pre>
        </details>
      )}

      <div className="grid gap-6">
        {dresses.map((dress) => {
          const badgeLabel = formatMatchBadge(dress.score, topScore);
          const tokens = keysForDress(dress);
          let totalMatches = 0;
          let highPriorityMatches = 0;

          tokens.forEach((token) => {
            if (selectedTokens.has(token)) {
              totalMatches += 1;
              if (highPriorityTokens.has(token)) {
                highPriorityMatches += 1;
              }
            }
          });

          const topLabel = totalSelectedCount >= 3 ? "top 3" : `top ${Math.max(totalSelectedCount, 1)}`;
          const insightLabel = `This item has ${formatCount(highPriorityMatches)} in your ${topLabel}. Overall matches: ${formatCount(totalMatches)}.`;
          const tooltipId = `match-tooltip-${dress.id}`;

          return (
            <div
              key={dress.id}
              className="relative flex bg-mauve-50 border border-mauve-200 rounded-2xl shadow p-6 transition hover:shadow-md"
            >
              {totalMatches > 0 && (
                <div
                  className="absolute right-4 top-4 flex flex-col items-end group"
                  data-testid={`match-insights-${dress.id}`}
                >
                  <button
                    type="button"
                    aria-label={insightLabel}
                    aria-describedby={tooltipId}
                    className="rounded-full bg-transparent p-1 text-emerald-500 shadow-none transition-transform duration-150 ease-out hover:text-emerald-400 focus:outline-none focus:ring focus:ring-emerald-200/50 group-hover:scale-105 group-focus-visible:scale-105"
                  >
                    <CheckCircle2 aria-hidden size={22} />
                  </button>
                  <TooltipContent
                    id={tooltipId}
                    highPriorityMatches={highPriorityMatches}
                    totalMatches={totalMatches}
                    selectedOrder={selectedOrder}
                  />
                </div>
              )}

              <div className="flex-1 pr-6">
                <h3 className="text-xl font-semibold text-mauve-900 mb-2">{dress.name}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-mauve-800">
                  <p>
                    <strong>Silhouette:</strong> {dress.silhouette}
                  </p>
                  <p>
                    <strong>Ships in 48hrs:</strong> {dress.shipin48hrs ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Neckline:</strong> {dress.neckline}
                  </p>
                  <p>
                    <strong>Sleeves:</strong> {dress.strapsleevelayout}
                  </p>
                  <p>
                    <strong>Length:</strong> {dress.length}
                  </p>
                  <p>
                    <strong>Collection:</strong> {dress.collection}
                  </p>
                  <p>
                    <strong>Fabric:</strong> {dress.fabric}
                  </p>
                  <p>
                    <strong>Color:</strong> {dress.color}
                  </p>
                  <p>
                    <strong>Back Style:</strong> {dress.backstyle}
                  </p>
                  <p>
                    <strong>Price:</strong> {currency.format(dress.price)}
                  </p>
                  <p>
                    <strong>Size Range:</strong> {dress.size_range}
                  </p>
                  <p>
                    <strong>Season:</strong> {dress.season}
                  </p>
                  <p>
                    <strong>Pockets:</strong> {dress.has_pockets ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Corset Back:</strong> {dress.corset_back ? "Yes" : "No"}
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  {!!(dress.tags && dress.tags.length) && (
                    <div>
                      <strong>Tags:</strong>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {(dress.tags ?? []).map((tag, idx) => (
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
                        {(dress.weddingvenue ?? []).map((venue, idx) => (
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
                        {(dress.embellishments ?? []).map((emb, idx) => (
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
                        {(dress.features ?? []).map((feat, idx) => (
                          <span key={idx} className="bg-mauve-100 text-mauve-800 px-2 py-1 rounded-full text-xs">
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-1/3 flex flex-col items-center justify-center">
                <div className="mb-2 text-mauve-900 text-lg font-bold">{badgeLabel}</div>
                <img
                  src={`${IMG_BASE}${dress.image_path}`}
                  alt={dress.name}
                  className="max-h-80 object-contain rounded-xl bg-white"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DressList;
