type FilterProps = {
  filters: any;
  setFilters: React.Dispatch<React.SetStateAction<any>>;
};

const FilterPanel = ({ filters, setFilters }: FilterProps) => {
  return (
    <div style={{ width: '250px' }}>
      <h2 style={{ fontWeight: 'bold' }}>Filters</h2>

      <label>Color:</label><br />
      <select
        value={filters.color}
        onChange={(e) => setFilters(prev => ({ ...prev, color: e.target.value }))}
      >
        <option value="">Any</option>
        <option value="Ivory">Ivory</option>
        <option value="White">White</option>
        <option value="Blush">Blush</option>
        <option value="Champagne">Champagne</option>
      </select>

      <br /><br />

      <label>Has Pockets:</label><br />
      <select
        value={filters.has_pockets}
        onChange={(e) => setFilters(prev => ({ ...prev, has_pockets: e.target.value }))}
      >
        <option value="">Any</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>

      <br /><br />

      <label>Price Min:</label><br />
      <input
        type="number"
        value={filters.priceMin}
        onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
      />

      <br /><br />

      <label>Price Max:</label><br />
      <input
        type="number"
        value={filters.priceMax}
        onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
      />
    </div>
  );
};

export default FilterPanel;
