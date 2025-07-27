import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';

const priceRanges = ['0-500', '500-1000', '1000-1500', '1500-2000', '2000+'];

type Filters = {
  [key: string]: string[] | string;
};

type Props = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  setPriorityScores: React.Dispatch<React.SetStateAction<Record<string, number>>>;
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

const defaultSectionOrder = [
  "Color", "Silhouette", "Neckline", "Length", "Fabric",
  "Backstyle", "Tags", "Embellishments", "Features",
  "Collection", "Season", "Price"
];

const FilterPanel = ({ filters, setFilters, setPriorityScores }: Props) => {
  const [sectionOrder, setSectionOrder] = useState(defaultSectionOrder);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const AccordionSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => {
    const isOpen = !!openSections[title];
    return (
      <div className="mb-4">
        <button
          onClick={() => toggleSection(title)}
          className="w-full text-left font-medium text-mauve-800 hover:text-mauve-600 transition"
        >
          {title} {isOpen ? '▲' : '▼'}
        </button>
        {isOpen && <div className="mt-2 ml-2">{children}</div>}
      </div>
    );
  };

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

  const calculatePriorityScores = () => {
    const scores: { [key: string]: number } = {};
    const baseSectionWeight = 100;

    sectionOrder.forEach((section, sectionIndex) => {
      const sectionWeight = baseSectionWeight - sectionIndex * 10;
      const fieldKey = section.toLowerCase();
      const selected = filters[fieldKey];

      if (Array.isArray(selected)) {
        selected.forEach((item, itemIndex) => {
          const itemWeight = sectionWeight - itemIndex;
          const scoreKey = `${fieldKey}:${item}`;
          scores[scoreKey] = itemWeight;
        });
      } else if (typeof selected === 'string' && selected === 'true') {
        scores[`${fieldKey}:true`] = sectionWeight;
      }
    });

    return scores;
  };

  useEffect(() => {
    const scores = calculatePriorityScores();
    setPriorityScores(scores);
  }, [filters, sectionOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="w-72 bg-white border border-mauve-200 rounded-2xl shadow p-6 h-fit sticky top-8 overflow-y-auto max-h-screen">
      <h2 className="text-xl font-bold mb-4">Filters</h2>

<pre className="text-xs text-gray-400 bg-gray-50 p-2 rounded mb-4 overflow-x-auto">
  {JSON.stringify(filters, null, 2)}
</pre>


      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (active.id !== over?.id) {
            setSectionOrder((items) => {
              const oldIndex = items.indexOf(active.id as string);
              const newIndex = items.indexOf(over?.id as string);
              return arrayMove(items, oldIndex, newIndex);
            });
          }
        }}
      >
        <SortableContext
          items={sectionOrder}
          strategy={verticalListSortingStrategy}
        >
          {sectionOrder.map((section) => (
            <SortableItem key={section} id={section}>
              <AccordionSection title={section}>
                {section === 'Price'
                  ? priceRanges.map(range => (
                      <label key={range} className="flex items-center mb-1 text-sm text-mauve-800">
                        <input
                          type="checkbox"
                          checked={Array.isArray(filters.price) && filters.price.includes(range)}
                          onChange={() => handleMultiCheckbox('price', range)}
                          className="mr-2"
                        />
                        {range === '2000+'
                          ? '$2000+'
                          : `$${range.split('-')[0]} – $${range.split('-')[1]}`}
                      </label>
                    ))
                  : sections[section]?.map(option => (
                      <label key={option} className="flex items-center mb-1 text-sm text-mauve-800">
                        <input
                          type="checkbox"
                          checked={
                            Array.isArray(filters[section.toLowerCase()]) &&
                            filters[section.toLowerCase()].includes(option)
                          }
                          onChange={() => handleMultiCheckbox(section.toLowerCase(), option)}
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}
              </AccordionSection>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default FilterPanel;
