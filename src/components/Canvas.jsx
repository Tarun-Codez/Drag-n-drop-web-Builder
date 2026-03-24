import {
  useDroppable,
} from '@dnd-kit/core';
import { useEffect, useRef } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import CanvasElement from './CanvasElement';

function CanvasDropZone({ children, viewMode }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop' });
  const localRef = useRef(null);
  const setCanvasRect = useBuilderStore((s) => s.setCanvasRect);

  useEffect(() => {
    const updateRect = () => {
      if (!localRef.current) return;
      const rect = localRef.current.getBoundingClientRect();
      setCanvasRect({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [setCanvasRect, viewMode]);

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        localRef.current = node;
      }}
      className={`mx-auto min-h-[70vh] rounded-2xl border-2 border-dashed bg-white p-4 transition ${
        viewMode === 'mobile' ? 'w-[390px]' : 'w-full'
      } ${isOver ? 'border-blue-400 shadow-lg' : 'border-slate-300'}`}
    >
      {children}
    </div>
  );
}

export default function Canvas() {
  const elements = useBuilderStore((s) => s.elements);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const viewMode = useBuilderStore((s) => s.viewMode);
  const setSelectedId = useBuilderStore((s) => s.setSelectedId);

  return (
    <CanvasDropZone viewMode={viewMode}>
      {elements.length ? (
        <div className="relative min-h-[66vh] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {elements
            .slice()
            .sort((a, b) => Number(a.style?.zIndex || 1) - Number(b.style?.zIndex || 1))
            .map((element) => (
              <CanvasElement
                key={element.id}
                element={element}
                selected={selectedId === element.id}
                onSelect={() => setSelectedId(element.id)}
              />
            ))}
        </div>
      ) : (
        <div className="flex min-h-[60vh] items-center justify-center rounded-xl border border-dashed border-slate-200 text-slate-400">
          Drag components here to start building.
        </div>
      )}
    </CanvasDropZone>
  );
}
