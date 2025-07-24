import { useEffect, useState } from 'react';
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
  priceMin: string;
  priceMax: string;
};

function App() {
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [filters, setFilters] = useState({
  color: [] as string[],
  silhouette: [] as string[],
  neckline: [] as string[],
  length: [] as string[],
  fabric: [] as string[],
  backstyle: [] as string[],
  collection: [] as string[],
  season: [] as string[],
  strapsleevelayout: [] as string[],
  tags: [] as string[],
  embellishments: [] as string[],
  features: [] as string[],
  shipin48hrs: "",
  has_pockets: "",
  corset_back: "",
  priceMin: "",
  priceMax: ""
});


  const fetchDresses = () => {
    const params: any = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params[key] = value.join(',');
      } else if (value !== '') {
        params[key] = value;
      }
    });

    axios
      .get('http://127.0.0.1:5050/api/dresses', { params })
      .then((res) => setDresses(res.data))
      .catch((err) => console.error('Error fetching dresses:', err));
  };

  useEffect(() => {
    fetchDresses();
  }, [filters]);

  return (
    <div className="min-h-screen bg-mauve-50 p-8 flex gap-8">
      <FilterPanel filters={filters} setFilters={setFilters} />
      <DressList dresses={dresses} />
    </div>
  );
}

export default App;
