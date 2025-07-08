type Dress = {
  id: number;
  name: string;
  silhouette: string;
  neckline: string;
  fabric: string;
  color: string;
  has_pockets: boolean;
  corset_back: boolean;
  price: number;
  size_range: string;
};

type Props = {
  dresses: Dress[];
};

const DressList = ({ dresses }: Props) => {
  if (dresses.length === 0) return <p>No dresses found.</p>;

  return (
    <div style={{ flex: 1 }}>
      <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Results</h2>
      {dresses.map(dress => (
        <div key={dress.id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{dress.name}</h3>
          <p>{dress.color} • {dress.fabric} • ${dress.price}</p>
          <p>{dress.silhouette} • Pockets: {dress.has_pockets ? "Yes" : "No"}</p>
        </div>
      ))}
    </div>
  );
};

export default DressList;
