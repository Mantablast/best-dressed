import { useEffect, useState } from 'react';
import axios from 'axios';
import FilterPanel from './components/FilterPanel';
import DressList from './components/DressList';

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

function App() {
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [filters, setFilters] = useState({
    color: '',
    has_pockets: '',
    corset_back: '',
    priceMin: '',
    priceMax: ''
  });

  const fetchDresses = () => {
    const params: any = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '') params[key] = value;
    });

    axios.get('http://127.0.0.1:5000/dresses', { params })
      .then(res => setDresses(res.data))
      .catch(err => console.error("Error fetching dresses:", err));
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
