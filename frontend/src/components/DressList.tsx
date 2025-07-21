type Dress = {
  id: number;
  name: string;
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
  image_path: string;
};

type Props = {
  dresses: Dress[];
};

const DressList = ({ dresses }: Props) => {
  if (dresses.length === 0)
    return <p className="text-gray-500">No dresses found.</p>;

  return (
    <div className="flex-1">
      <h2 className="text-2xl font-bold mb-4">Results</h2>
      <div className="grid gap-6">
        {dresses.map((dress) => (
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
                <p>
                  <strong>Silhouette:</strong> {dress.silhouette}
                </p>
                <p>
                  <strong>Ships in 48hrs:</strong>{" "}
                  {dress.shipin48hrs ? "Yes" : "No"}
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
                  <strong>Price:</strong> ${dress.price}
                </p>
                <p>
                  <strong>Size Range:</strong> {dress.size_range}
                </p>
                <p>
                  <strong>Season:</strong> {dress.season}
                </p>
                <p>
                  <strong>Pockets:</strong>{" "}
                  {dress.has_pockets ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Corset Back:</strong>{" "}
                  {dress.corset_back ? "Yes" : "No"}
                </p>
              </div>

              {/* Tags, Venue, Embellishments, Features */}
              <div className="mt-4 space-y-2">
                {dress.tags && dress.tags.length > 0 && (
                  <div>
                    <strong>Tags:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {dress.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-mauve-100 text-mauve-800 px-2 py-1 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {dress.weddingvenue && dress.weddingvenue.length > 0 && (
                  <div>
                    <strong>Venue:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {dress.weddingvenue.map((venue, idx) => (
                        <span
                          key={idx}
                          className="bg-mauve-100 text-mauve-800 px-2 py-1 rounded-full text-xs"
                        >
                          {venue}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {dress.embellishments && dress.embellishments.length > 0 && (
                  <div>
                    <strong>Embellishments:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {dress.embellishments.map((emb, idx) => (
                        <span
                          key={idx}
                          className="bg-mauve-100 text-mauve-800 px-2 py-1 rounded-full text-xs"
                        >
                          {emb}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {dress.features && dress.features.length > 0 && (
                  <div>
                    <strong>Features:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {dress.features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="bg-mauve-100 text-mauve-800 px-2 py-1 rounded-full text-xs"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Image */}
            <div className="w-1/3 flex justify-center items-center">
              <img
                src={`http://localhost:5050/static/images/${dress.image_path}`}
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
