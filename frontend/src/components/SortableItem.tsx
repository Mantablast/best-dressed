import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react'; // optional drag icon

export function SortableItem({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2 border border-mauve-200 rounded-lg">
      <div className="flex items-center px-2 py-1 cursor-grab" {...attributes} {...listeners}>
        <GripVertical className="text-mauve-500 mr-2" />
        <span className="text-sm text-mauve-600">{id}</span>
      </div>
      <div className="px-4 pb-4 pt-1">{children}</div>
    </div>
  );
}
