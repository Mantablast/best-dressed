import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Filters } from "@/types/filters";

/** ---------- Types ---------- */

type MultiKey =
  | "color"
  | "silhouette"
  | "neckline"
  | "length"
  | "fabric"
  | "backstyle"
  | "collection"
  | "season"
  | "tags"
  | "embellishments"
  | "features"
  | "sleeves";

type Options = Record<MultiKey, readonly string[]>;

type Props = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  options: Options;
};

type Section = {
  key: MultiKey;
  label: string;
};

const DEFAULT_SECTIONS: Section[] = [
  { key: "color", label: "Color" },
  { key: "silhouette", label: "Silhouette" },
  { key: "neckline", label: "Neckline" },
  { key: "length", label: "Length" },
  { key: "fabric", label: "Fabric" },
  { key: "backstyle", label: "Back Style" },
  { key: "collection", label: "Collection" },
  { key: "season", label: "Season" },
  { key: "tags", label: "Tags" },
  { key: "embellishments", label: "Embellishments" },
  { key: "features", label: "Features" },
  { key: "sleeves", label: "Sleeves" },
];

/** ---------- Sortable Section Row ---------- */

function SortableSection({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl bg-neutral-900">
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800">
        <h3 className="text-sm font-semibold text-white/90">{label}</h3>
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="cursor-grab rounded-md px-2 py-1 text-xs text-white/70 hover:bg-neutral-800 active:cursor-grabbing"
          aria-label={`Drag ${label} to reorder`}
          title="Drag to reorder"
        >
          ☰
        </button>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

/** ---------- Component ---------- */

export default function FilterPanel({ filters, setFilters, options }: Props) {
  const [sections, setSections] = useState<string[]>(
    DEFAULT_SECTIONS.map((s) => s.key)
  );

  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(DEFAULT_SECTIONS.map((s) => [s.key, true]))
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function onDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSections((prev) => {
      const oldIndex = prev.indexOf(active.id);
      const newIndex = prev.indexOf(over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function toggleOpen(key: string) {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleMulti(key: MultiKey, value: string) {
    setFilters((prev) => {
      const current = new Set(prev[key]);
      current.has(value) ? current.delete(value) : current.add(value);
      return { ...prev, [key]: Array.from(current) };
    });
  }

  function setBool<K extends "has_pockets" | "corset_back" | "shipin48hrs">(
    key: K,
    next: boolean | null
  ) {
    setFilters((prev) => ({ ...prev, [key]: next }));
  }

  function setPrice(minOrMax: "priceMin" | "priceMax", v: string) {
    const num = v.trim() === "" ? null : Number(v);
    setFilters((prev) => ({
      ...prev,
      [minOrMax]: Number.isNaN(num) ? null : num,
    }));
  }

  return (
    <div className="space-y-4">
      {/* quick toggles / meta */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-white/80">Ships in 48 hrs</label>
            <select
              value={
                filters.shipin48hrs === null
                  ? ""
                  : filters.shipin48hrs
                  ? "true"
                  : "false"
              }
              onChange={(e) =>
                setBool(
                  "shipin48hrs",
                  e.target.value === "" ? null : e.target.value === "true"
                )
              }
              className="bg-neutral-800 rounded-md px-2 py-1 text-sm"
            >
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-white/80">Has pockets</label>
            <select
              value={
                filters.has_pockets === null
                  ? ""
                  : filters.has_pockets
                  ? "true"
                  : "false"
              }
              onChange={(e) =>
                setBool(
                  "has_pockets",
                  e.target.value === "" ? null : e.target.value === "true"
                )
              }
              className="bg-neutral-800 rounded-md px-2 py-1 text-sm"
            >
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-white/80">Corset back</label>
            <select
              value={
                filters.corset_back === null
                  ? ""
                  : filters.corset_back
                  ? "true"
                  : "false"
              }
              onChange={(e) =>
                setBool(
                  "corset_back",
                  e.target.value === "" ? null : e.target.value === "true"
                )
              }
              className="bg-neutral-800 rounded-md px-2 py-1 text-sm"
            >
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-white/70 mb-1">
                Price Min
              </label>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full bg-neutral-800 rounded-md px-2 py-1 text-sm"
                value={filters.priceMin ?? ""}
                onChange={(e) => setPrice("priceMin", e.target.value)}
                placeholder="e.g. 500"
              />
            </div>
            <div>
              <label className="block text-xs text-white/70 mb-1">
                Price Max
              </label>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full bg-neutral-800 rounded-md px-2 py-1 text-sm"
                value={filters.priceMax ?? ""}
                onChange={(e) => setPrice("priceMax", e.target.value)}
                placeholder="e.g. 2500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* draggable sections */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={sections} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {sections.map((key) => {
              const section = DEFAULT_SECTIONS.find(
                (s) => s.key === (key as MultiKey)
              )!;
              const opts = options[section.key];

              return (
                <SortableSection
                  key={section.key}
                  id={section.key}
                  label={section.label}
                >
                  <button
                    onClick={() => toggleOpen(section.key)}
                    className="mb-2 text-xs rounded-md px-2 py-1 bg-neutral-800 hover:bg-neutral-700"
                    aria-expanded={open[section.key]}
                    aria-controls={`panel-${section.key}`}
                  >
                    {open[section.key] ? "Hide" : "Show"} {section.label}
                  </button>

                  {open[section.key] && (
                    <div
                      id={`panel-${section.key}`}
                      className="grid grid-cols-1 gap-2"
                    >
                      {opts.map((opt) => {
                        const checked = (filters[section.key] as string[]).includes(
                          opt
                        );
                        return (
                          <label
                            key={opt}
                            className="flex items-center justify-between gap-3 rounded-md bg-neutral-800 px-2 py-1"
                          >
                            <span className="text-sm">{opt}</span>
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-white"
                              checked={checked}
                              onChange={() => toggleMulti(section.key, opt)}
                            />
                          </label>
                        );
                      })}
                    </div>
                  )}
                </SortableSection>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() =>
            setFilters({
              color: [],
              silhouette: [],
              neckline: [],
              length: [],
              fabric: [],
              backstyle: [],
              collection: [],
              season: [],
              tags: [],
              embellishments: [],
              features: [],
              sleeves: [],
              has_pockets: null,
              corset_back: null,
              shipin48hrs: null,
              priceMin: null,
              priceMax: null,
            })
          }
          className="text-sm rounded-md bg-neutral-800 px-3 py-2 hover:bg-neutral-700"
        >
          Reset all
        </button>
      </div>
    </div>
  );
}
