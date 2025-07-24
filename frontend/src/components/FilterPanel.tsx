import React, { useState } from 'react';

type Filters = {
  [key: string]: string[] | string;
};

type Props = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
};

const sections = {
  Color: ['Ivory', 'Pink', 'White', 'Black', 'Blush', 'Champagne'],
  Silhouette: ['A-line', 'Ballgown', 'Sheath', 'Mermaid', 'Fit-and-Flare'],
  Neckline: ['Sweetheart', 'Off-the-Shoulder', 'V-neck', 'High Neck', 'Halter'],
  Length: ['Knee Length', 'Floor Length', 'Ankle Length', 'Chapel Train', 'Sweep Train', 'Cathedral Train'],
  Fabric: ['Lace', 'Tulle', 'Satin', 'Chiffon', 'Organza'],
  Backstyle: ['Corset Back', 'Zipper', 'Zipper + Buttons', 'Keyhole Back', 'Illusion Back', 'Lace-Up', 'Low Back'],
  Tags: ['elegant', 'vintage', 'lace', 'dramatic', 'princess', 'twilight', 'minimal', 'modern', 'sleek'],
  Embellishments: ['beading', 'embroidery', 'sequins', 'none', 'floral appliqué', 'glitter tulle', 'crystals'],
  Features: ['pockets', 'convertible', 'Stay-in-place straps', 'built-in bra', 'removable train'],
  Collection: ['Golden Hour', 'Midnight Bloom', 'Modern Muse', 'Botanical Romance', 'Moonlight Collection', 'Rose Reverie'],
  Season: ['spring', 'summer', 'fall', 'winter'],
};

const booleanFilters = ['has_pockets', 'corset_back', 'shipin48hrs'];

const AccordionSection = ({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left font-medium text-mauve-800 hover:text-mauve-600 transition"
      >
        {title} {open ? '▲' : '▼'}
      </button>
      {open && <div className="mt-2 ml-2">{children}</div>}
    </div>
  );
};

const FilterPanel = ({ filters, setFilters }: Props) => {
  const handleMultiCheckbox = (field: string, value: string) => {
    setFilters(prev => {
      const current = prev[field] || [];
      const newValues = Array.isArray(current)
        ? current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value]
        : [value];
      return { ...prev, [field]: newValues };
    });
  };

  const handleBoolean = (field: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: prev[field] === 'true' ? '' : 'true'
    }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-72 bg-white border border-mauve-200 rounded-2xl shadow p-6 h-fit sticky top-8 overflow-y-auto max-h-screen">
      <h2 className="text-xl font-bold mb-4">Filters</h2>

      {Object.entries(sections).map(([section, options]) => (
        <AccordionSection key={section} title={section}>
          {options.map(option => (
            <label key={option} className="flex items-center mb-1 text-sm text-mauve-800">
              <input
                type="checkbox"
                checked={Array.isArray(filters[section.toLowerCase()]) && filters[section.toLowerCase()].includes(option)}
                onChange={() => handleMultiCheckbox(section.toLowerCase(), option)}
                className="mr-2"
              />
              {option}
            </label>
          ))}
        </AccordionSection>
      ))}

      {booleanFilters.map(field => (
        <div key={field} className="mb-2">
          <label className="flex items-center text-sm text-mauve-800">
            <input
              type="checkbox"
              checked={filters[field] === 'true'}
              onChange={() => handleBoolean(field)}
              className="mr-2"
            />
            {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </label>
        </div>
      ))}

      <AccordionSection title="Price">
        <label className="block text-sm font-medium text-mauve-800 mb-1">Min</label>
        <input
          type="number"
          name="priceMin"
          value={filters.priceMin || ''}
          onChange={handlePriceChange}
          className="w-full border rounded px-2 py-1 mb-2"
        />
        <label className="block text-sm font-medium text-mauve-800 mb-1">Max</label>
        <input
          type="number"
          name="priceMax"
          value={filters.priceMax || ''}
          onChange={handlePriceChange}
          className="w-full border rounded px-2 py-1"
        />
      </AccordionSection>
    </div>
  );
};

export default FilterPanel;
