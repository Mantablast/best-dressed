import React from 'react';

type Filters = {
  color: string;
  silhouette: string;
  neckline: string;
  has_pockets: string;
  corset_back: string;
  priceMin: string;
  priceMax: string;
};

type Props = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
};

const FilterPanel = ({ filters, setFilters }: Props) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? (checked ? 'true' : 'false') : value;
    setFilters(prev => ({ ...prev, [name]: newValue }));
  };

  return (
    <div className="w-72 bg-white border border-mauve-200 rounded-2xl shadow p-6 h-fit sticky top-8">
      <h2 className="text-xl font-bold mb-4">Filters</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-mauve-800 mb-1">Color</label>
        <input
          type="text"
          name="color"
          value={filters.color}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-mauve-800 mb-1">Silhouette</label>
        <select
          name="silhouette"
          value={filters.silhouette}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
        >
          <option value="">All</option>
          <option value="A-line">A-line</option>
          <option value="Ballgown">Ballgown</option>
          <option value="Sheath">Sheath</option>
          <option value="Mermaid">Mermaid</option>
          <option value="Fit-and-Flare">Fit-and-Flare</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-mauve-800 mb-1">Neckline</label>
        <select
          name="neckline"
          value={filters.neckline}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
        >
          <option value="">All</option>
          <option value="Sweetheart">Sweetheart</option>
          <option value="Off-the-Shoulder">Off-the-Shoulder</option>
          <option value="V-neck">V-neck</option>
          <option value="High Neck">High Neck</option>
          <option value="Halter">Halter</option>
        </select>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <input
          type="checkbox"
          name="has_pockets"
          checked={filters.has_pockets === 'true'}
          onChange={handleChange}
        />
        <label className="text-sm text-mauve-800">Has Pockets</label>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <input
          type="checkbox"
          name="corset_back"
          checked={filters.corset_back === 'true'}
          onChange={handleChange}
        />
        <label className="text-sm text-mauve-800">Corset Back</label>
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium text-mauve-800 mb-1">Price Min</label>
        <input
          type="number"
          name="priceMin"
          value={filters.priceMin}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
        />
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium text-mauve-800 mb-1">Price Max</label>
        <input
          type="number"
          name="priceMax"
          value={filters.priceMax}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
        />
      </div>
    </div>
  );
};

export default FilterPanel;
