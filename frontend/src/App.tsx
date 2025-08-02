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
  price: string[];
};


function App() {
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
  price: [] as string[]
});
const [priorityScores, setPriorityScores] = useState<{ [key: string]: number }>({});


  const fetchDresses = () => {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((val) => {
        if (val) {
          searchParams.append(key, val);
        }
      });
    } else if (value !== '') {
      searchParams.append(key, value);
    }
  });

console.log("Sending filters:", filters);
console.log("Query string:", searchParams.toString());

  axios
    .get(`http://127.0.0.1:5050/api/dresses?${searchParams.toString()}`)
    .then((res) => setDresses(res.data))
    .catch((err) => console.error('Error fetching dresses:', err));
};


  useEffect(() => {
    fetchDresses();
  }, [filters]);

  return (
      <div>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
  <h3 className="font-bold mb-4">Best Dressed - Priority Search Concept</h3>
  <p style={{ maxWidth: "800px", margin: "0 auto" }}>
    A search filter proof of concept that allows users to choose and sort filter
    items by priority to have the closest priority match displayed to them with
    a real-time priority score. It aids the user with their decision making, making a basic
    filter search a much more customized experience.
  </p>
</div>
    <div className="min-h-screen bg-mauve-50 p-8 flex gap-8">
      <FilterPanel
  filters={filters}
  setFilters={setFilters}
  setPriorityScores={setPriorityScores}
/>
      <DressList dresses={dresses} priorityScores={priorityScores} />
    </div>

    </div>
  );
}

export default App;
