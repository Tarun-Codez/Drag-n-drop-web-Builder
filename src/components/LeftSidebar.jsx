import { COMPONENT_LIBRARY, TEMPLATES } from '../lib/componentLibrary';
import { useBuilderStore } from '../store/useBuilderStore';
import DraggableLibraryItem from './DraggableLibraryItem';

export default function LeftSidebar() {
  const loadTemplate = useBuilderStore((s) => s.loadTemplate);

  return (
    <aside className="h-full overflow-y-auto border-r border-slate-200 bg-slate-50 p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">Components</h2>
      <div className="space-y-2">
        {COMPONENT_LIBRARY.map((item) => (
          <DraggableLibraryItem key={item.type} item={item} />
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-slate-600">Templates</h2>
      <div className="space-y-2">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => loadTemplate(template.id)}
            className="w-full rounded-xl border border-dashed border-slate-300 bg-white p-3 text-left text-sm transition hover:border-blue-400"
          >
            {template.name}
          </button>
        ))}
      </div>
    </aside>
  );
}
