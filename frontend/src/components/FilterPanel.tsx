import React, { useState, useEffect, startTransition } from 'react';
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
import SortableItem from './SortableItem';

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
  const norm = (v: string) => v?.trim().toLowerCase();
  const [sectionOrder, setSectionOrder] = useState(defaultSectionOrder);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});
  const [selectedOrder, setSelectedOrder] = useState<{ [key: string]: string[] }>({});

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleMultiCheckbox = (field: string, value: string) => {
    startTransition(() => {
      setFilters(prev => {
        const current = prev[field] || [];
        let newValues: string[];
        if (Array.isArray(current)) {
          newValues = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        } else {
          newValues = [value];
        }

        setSelectedOrder(prevOrder => {
          const currOrder = prevOrder[field] || [];
          return {
            ...prevOrder,
            [field]: newValues.filter(v => currOrder.includes(v)).concat(
              newValues.filter(v => !currOrder.includes(v))
            )
          };
        });

        return { ...prev, [field]: newValues };
      });
    });
  };

  const calculatePriorityScores = () => {
    const scores: { [key: string]: number } = {};
    const baseSectionWeight = 100;

    sectionOrder.forEach((section, sectionIndex) => {
      const sectionWeight = baseSectionWeight - sectionIndex * 10;
      const fieldKey = section.toLowerCase();
      const selectedItems = selectedOrder[fieldKey] || [];

      selectedItems.forEach((item, itemIndex) => {
        const itemWeight = sectionWeight - itemIndex;
        scores[`${fieldKey}:${norm(item)}`] = itemWeight;
      });
    });

    return scores;
  };

  useEffect(() => {
    const scores = calculatePriorityScores();
    startTransition(() => {
      setPriorityScores(scores);
    });
  }, [filters, sectionOrder, selectedOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <div className="w-72 bg-white border border-mauve-200 rounded-2xl shadow p-6 h-fit sticky top-8 overflow-y-auto max-h-screen">
        <h3 className="text-xs font-bold mb-4">Drag the sections and checked items around to identify what dress features are most important.  (Most important items and sections go to the top.)</h3>
      <h2 className="text-xl font-bold mb-4">Filters</h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!over) return;

          // Section reorder
          if (sectionOrder.includes(active.id as string)) {
            if (active.id !== over.id) {
              setSectionOrder((items) => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over.id as string);
                return arrayMove(items, oldIndex, newIndex);
              });
            }
            return;
          }

          // Item reorder
          const [sectionKey] = (active.id as string).split(':');
          const newOrder = [...(selectedOrder[sectionKey] || [])];
          const oldIndex = newOrder.indexOf((active.id as string).split(':')[1]);
          const newIndex = newOrder.indexOf((over.id as string).split(':')[1]);
          setSelectedOrder(prev => ({
            ...prev,
            [sectionKey]: arrayMove(newOrder, oldIndex, newIndex)
          }));
        }}
      >
        <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
          {sectionOrder.map((section) => {
            const fieldKey = section.toLowerCase();
            const selectedItems = selectedOrder[fieldKey] || [];

            // Determine items to render (regular sections vs Price)
            const items = section === "Price" ? priceRanges : sections[section];

            return (
              <SortableItem key={section} id={section}>
                {({ handleProps }) => (
                  <div className="mb-4 border-b border-mauve-200 pb-2">
                    <div className="flex items-center cursor-pointer">
                      {/* Drag handle on the left */}
                      <span
                        {...handleProps.listeners}
                        ref={handleProps.ref}
                        className="mr-2 cursor-grab text-mauve-400 hover:text-mauve-600 select-none"
                        title="Drag section"
                      >
                        ☰
                      </span>

                      {/* Section toggle button */}
                      <button
                        className="text-left font-semibold text-mauve-800 hover:text-mauve-600 transition flex-1"
                        onClick={() => toggleSection(section)}
                      >
                        {section} {openSections[section] ? '▲' : '▼'}
                      </button>
                    </div>

                    {openSections[section] && (
                      <div className="mt-2 ml-2">
                        {/* Selected items with DnD */}
                        <SortableContext
                          items={selectedItems.map(item => `${fieldKey}:${item}`)}
                          strategy={verticalListSortingStrategy}
                        >
                          {selectedItems.map(item => (
                            <SortableItem key={`${fieldKey}:${item}`} id={`${fieldKey}:${item}`}>
                              {({ handleProps }) => (
                                <label className="flex items-center mb-1 text-sm text-mauve-800 font-medium">
                                  <span
                                    {...handleProps.listeners}
                                    ref={handleProps.ref}
                                    className="mr-2 cursor-grab text-mauve-400 hover:text-mauve-600 select-none"
                                    title="Drag item"
                                  >
                                    ☰
                                  </span>
                                  <input
                                    type="checkbox"
                                    checked={filters[fieldKey]?.includes(item)}
                                    onChange={() => handleMultiCheckbox(fieldKey, item)}
                                    className="mr-2"
                                  />
                                  {item}
                                </label>
                              )}
                            </SortableItem>
                          ))}
                        </SortableContext>

                        {/* Unselected items */}
                        {items
                          ?.filter(item => !selectedItems.includes(item))
                          .map(item => (
                            <label
                              key={item}
                              className="flex items-center mb-1 text-sm text-mauve-600"
                            >
                              <input
                                type="checkbox"
                                checked={filters[fieldKey]?.includes(item)}
                                onChange={() => handleMultiCheckbox(fieldKey, item)}
                                className="mr-2"
                              />
                              {item}
                            </label>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </SortableItem>
            );
          })}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default FilterPanel;
