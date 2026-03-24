import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export default function DraggableLibraryItem({ item }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `library:${item.type}`,
    data: { type: 'library', componentType: item.type },
  });

  return (
    <button
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={`w-full rounded-xl border border-slate-200 bg-white p-3 text-left text-sm font-medium transition hover:border-blue-400 hover:shadow ${isDragging ? 'opacity-60' : ''}`}
      {...listeners}
      {...attributes}
      type="button"
    >
      {item.label}
    </button>
  );
}
