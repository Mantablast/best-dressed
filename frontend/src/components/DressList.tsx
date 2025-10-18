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
          return (
            <div
              key={dress.id}
              className="flex bg-mauve-50 border border-mauve-200 rounded-2xl shadow p-6 transition hover:shadow-md"
            >
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
