import { useEffect, useState } from 'react';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Toaster } from 'react-hot-toast';
import AuthModal from './components/AuthModal';
import Canvas from './components/Canvas';
import LeftSidebar from './components/LeftSidebar';
import LivePreview from './components/LivePreview';
import RightSidebar from './components/RightSidebar';
import TopBar from './components/TopBar';
import { setAuthToken } from './services/api';
import { useBuilderStore } from './store/useBuilderStore';

function App() {
  const [user, setUser] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeDragId, setActiveDragId] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const addElement = useBuilderStore((s) => s.addElement);

  useEffect(() => {
    // Restore auth session on refresh.
    const token = localStorage.getItem('builder_token');
    const userRaw = localStorage.getItem('builder_user');

    if (token && userRaw) {
      setAuthToken(token);
      setUser(JSON.parse(userRaw));
    }
  }, []);

  if (!user) {
    return (
      <>
        <AuthModal onAuthed={setUser} />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div className="h-screen bg-slate-100 text-slate-900">
      <TopBar user={user} onLogout={() => setUser(null)} onPreview={() => setPreviewOpen(true)} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(event) => setActiveDragId(String(event.active.id))}
        onDragEnd={(event) => {
          setActiveDragId(null);
          const { active, over } = event;
          if (!over) return;

          const activeId = String(active.id);
          const overId = String(over.id);

          // Drag from component library => create new element in canvas.
          if (activeId.startsWith('library:')) {
            const componentType = activeId.split(':')[1];

            if (overId === 'canvas-drop') {
              const pointerEvent = event.activatorEvent;
              addElement(componentType, {
                clientX: pointerEvent?.clientX,
                clientY: pointerEvent?.clientY,
              });
              return;
            }
            return;
          }
        }}
      >
        <main className="grid h-[calc(100vh-61px)] grid-cols-[260px_1fr_320px]">
          <LeftSidebar />

          <section className="overflow-y-auto p-5">
            <Canvas />
          </section>

          <RightSidebar />
        </main>

        <DragOverlay>
          {activeDragId ? (
            <div className="rounded border border-blue-300 bg-blue-50 px-3 py-2 text-sm text-blue-700 shadow">
              {activeDragId.startsWith('library:') ? `Add ${activeDragId.split(':')[1]}` : 'Move component'}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {previewOpen ? <LivePreview onClose={() => setPreviewOpen(false)} /> : null}

      <Toaster position="top-right" />
    </div>
  );
}

export default App;
