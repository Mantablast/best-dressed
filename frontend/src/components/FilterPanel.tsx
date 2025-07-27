import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';

type Filters = {
  [key: string]: string[] | string;
};

type Props = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  setPriorityScores: React.Dispatch<React.SetStateAction<Record<string, number>>>;
};

const priceRanges = ['0-500', '500-1000', '1000-1500', '1500-2000', '2000+'];

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
  Season: ['spring', 'summer', 'fall', 'winter']
};

const defaultSectionOrder = [
  "Color", "Silhouette", "Neckline", "Length", "Fabric",
  "Backstyle", "Tags", "Embellishments", "Features",
  "Collection", "Season", "Price"
];

export default function FilterPanel({ filters, setFilters, setPriorityScores }: Props) {
  const [sectionOrder, setSectionOrder] = useState(defaultSectionOrder);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
const AccordionSection = ({
  title,
  children,
  isOpen,
  toggleOpen,
  dragHandleProps,
}: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  toggleOpen: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLSpanElement>;
}) => {
  return (
    <div className="mb-4 border-b border-mauve-200 pb-2">
      <div className="flex items-center justify-between cursor-pointer">
        <button
          onClick={toggleOpen}
          className="text-left font-semibold text-mauve-800 hover:text-mauve-600 transition flex-1"
        >
          {title} {isOpen ? '▲' : '▼'}
        </button>
        <span
          {...dragHandleProps}
          className="ml-2 cursor-grab text-mauve-400 hover:text-mauve-600"
          title="Drag to reorder"
        >
          ☰
        </span>
      </div>
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
    const scores: Record<string, number> = {};
    const baseWeight = 100;

    sectionOrder.forEach((section, idx) => {
      const weight = baseWeight - idx * 10;
      const fieldKey = section.toLowerCase();
      const selected = filters[fieldKey];

      if (Array.isArray(selected)) {
        selected.forEach((val, j) => {
          scores[`${fieldKey}:${val}`] = weight - j;
        });
      } else if (selected === 'true') {
        scores[`${fieldKey}:true`] = weight;
      }
    });

    return scores;
  };

  useEffect(() => {
    setPriorityScores(calculatePriorityScores());
  }, [filters, sectionOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  return (
    <div className="w-72 bg-white border border-mauve-200 rounded-2xl shadow p-6 h-fit sticky top-8 overflow-y-auto max-h-screen">
      <h2 className="text-xl font-bold mb-4">Filters</h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (active.id !== over?.id) {
            setSectionOrder(items => {
              const oldIdx = items.indexOf(active.id as string);
              const newIdx = items.indexOf(over.id as string);
              return arrayMove(items, oldIdx, newIdx);
            });
          }
        }}
      >
        <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
          {sectionOrder.map(section => (
            <SortableItem key={section} id={section}>
  {(dragHandleProps) => (
    <AccordionSection
      title={section}
      isOpen={!!openSections[section]}
      toggleOpen={() => toggleSection(section)}
      dragHandleProps={dragHandleProps}
    >
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
  )}
</SortableItem>

          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
