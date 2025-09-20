import React, { useState, startTransition } from 'react';
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
import type { Filters } from "../types/filters";

const priceRanges = ['0-500', '500-1000', '1000-1500', '1500-2000', '2000+'];



type Props = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;

  // lifted ordering state from App:
  sectionOrder: string[];
  setSectionOrder: React.Dispatch<React.SetStateAction<string[]>>;
  selectedOrder: Record<string, string[]>;
  setSelectedOrder: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
};

const sections: Record<string, string[]> = {
  Color: ['Ivory', 'Pink', 'White', 'Black', 'Blush', 'Champagne'],
  Silhouette: ['A-line', 'Ballgown', 'Sheath', 'Mermaid', 'Fit-and-Flare'],
  Neckline: ['Sweetheart', 'Off-the-Shoulder', 'V-neck', 'High Neck', 'Halter', 'Straight Across'],
  Length: ['Knee Length', 'Floor Length', 'Ankle Length', 'Chapel Train', 'Sweep Train', 'Cathedral Train'],
  Fabric: ['Lace', 'Tulle', 'Satin', 'Chiffon', 'Organza'],
  Backstyle: ['Corset Back', 'Zip-up', 'Zipper + Buttons', 'Keyhole Back', 'Illusion Back', 'Lace-Up', 'Low Back'],
  Tags: ['elegant', 'vintage', 'lace', 'dramatic', 'princess', 'twilight', 'minimal', 'modern', 'sleek'],
  Embellishments: ['beading', 'embroidery', 'sequins', 'none', 'floral appliqué', 'glitter tulle', 'crystals', 'pearls'],
  Features: ['pockets', 'convertible', 'Stay-in-place straps', 'built-in bra', 'removable train', 'easy bustle'],
  Collection: ['Golden Hour', 'Midnight Bloom', 'Modern Muse', 'Botanical Romance', 'Moonlight Collection', 'Rose Reverie'],
  Season: ['spring', 'summer', 'fall', 'winter'],
};

const FilterPanel = ({
  filters, setFilters,
  sectionOrder, setSectionOrder,
  selectedOrder, setSelectedOrder
}: Props) => {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Highlight a section title when it has ≥1 selection
  const hasAnySelection = (key: string) => {
    const v = (filters as any)[key];
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'string') return v.trim().length > 0;
    return false;
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
            [field]:
              newValues.filter(v => currOrder.includes(v))
                .concat(newValues.filter(v => !currOrder.includes(v))),
          };
        });

        return { ...prev, [field]: newValues };
      });
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <div className="w-72 bg-white border border-mauve-200 rounded-2xl shadow p-6 h-fit sticky top-8 overflow-y-auto max-h-screen">
      <h3 className="text-xs font-bold mb-4">
        Drag the sections and checked items around to identify what dress features are most important.
        (Most important items and sections go to the top.)
      </h3>
      <h2 className="text-xl font-bold mb-4">Filters</h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!over) return;

          // Section reorder
          if (sectionOrder.includes(active.id as string)) {
            if (active.id !== over.id) {
              setSectionOrder(items => {
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
            [sectionKey]: arrayMove(newOrder, oldIndex, newIndex),
          }));
        }}
      >
        <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
          {sectionOrder.map((section) => {
            const fieldKey = section.toLowerCase();
            const selectedItems = selectedOrder[fieldKey] || [];
            const selectedInSection = hasAnySelection(fieldKey);
            const items = section === 'Price' ? priceRanges : sections[section];

            return (
              <SortableItem key={section} id={section}>
                {({ handleProps }) => (
                  <div className="mb-4 border-b border-mauve-200 pb-2 background-color: inherit;">
                    <div className="flex items-center cursor-pointer background-color: inherit;">
                      {/* Drag handle on the left (section) */}
                      <span
                        {...handleProps.attributes}
                        {...handleProps.listeners}
                        ref={handleProps.ref}
                        className="mr-2 cursor-grab text-mauve-400 hover:text-mauve-600 select-none"
                        title="Drag section"
                      >
                        ☰
                      </span>

                      {/* Section toggle button */}
                      <button
                        className={`text-left font-semibold transition flex-1 rounded
                          ${selectedInSection
                            ? 'text-mauve-900 bg-mauve-50 border-l-4 border-mauve-500 pl-2'
                            : 'text-mauve-800 hover:text-mauve-600'}`}
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
                              {({ handleProps }) => {
                                const inputId = `${fieldKey}-${item}`.replace(/\s+/g, '_');
                                return (
                                  <div className="flex items-center mb-1 text-sm text-mauve-800 font-medium select-none">
                                    <span
                                      {...handleProps.attributes}
                                      {...handleProps.listeners}
                                      ref={handleProps.ref}
                                      className="mr-2 cursor-grab text-mauve-400 hover:text-mauve-600"
                                      title="Drag item"
                                    >
                                      ☰
                                    </span>
                                    <input
                                      id={inputId}
                                      type="checkbox"
                                      className="mr-2"
                                      onPointerDown={(e) => e.stopPropagation()} // prevent starting drag from input
                                      checked={
                                        Array.isArray((filters as any)[fieldKey])
                                          ? ((filters as any)[fieldKey] as string[]).includes(item)
                                          : false
                                      }
                                      onChange={() => handleMultiCheckbox(fieldKey, item)}
                                    />
                                    <label htmlFor={inputId} className="cursor-pointer select-none">
                                      {item}
                                    </label>
                                  </div>
                                );
                              }}
                            </SortableItem>
                          ))}
                        </SortableContext>

                        {/* Unselected items */}
                        {items
                          ?.filter(item => !selectedItems.includes(item))
                          .map(item => {
                            const inputId = `${fieldKey}-${item}`.replace(/\s+/g, '_');
                            return (
                              <div key={item} className="flex items-center mb-1 text-sm text-mauve-600 select-none">
                                <input
                                  id={inputId}
                                  type="checkbox"
                                  className="mr-2"
                                  onPointerDown={(e) => e.stopPropagation()} // avoid dragging from input
                                  checked={
                                    Array.isArray((filters as any)[fieldKey])
                                      ? ((filters as any)[fieldKey] as string[]).includes(item)
                                      : false
                                  }
                                  onChange={() => handleMultiCheckbox(fieldKey, item)}
                                />
                                <label htmlFor={inputId} className="cursor-pointer select-none">
                                  {item}
                                </label>
                              </div>
                            );
                          })}
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
