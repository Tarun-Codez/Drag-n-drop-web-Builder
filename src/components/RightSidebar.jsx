import { useMemo } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';

const styleFields = [
  { key: 'left', label: 'Left' },
  { key: 'top', label: 'Top' },
  { key: 'zIndex', label: 'Layer (z-index)' },
  { key: 'fontSize', label: 'Font Size' },
  { key: 'color', label: 'Text Color', type: 'color' },
  { key: 'padding', label: 'Padding' },
  { key: 'margin', label: 'Margin' },
  { key: 'textAlign', label: 'Align' },
  { key: 'backgroundColor', label: 'Background', type: 'color' },
  { key: 'borderWidth', label: 'Border Width' },
  { key: 'borderColor', label: 'Border Color', type: 'color' },
  { key: 'borderRadius', label: 'Border Radius' },
  { key: 'width', label: 'Width' },
  { key: 'height', label: 'Height' },
];

export default function RightSidebar() {
  const elements = useBuilderStore((s) => s.elements);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const updateElement = useBuilderStore((s) => s.updateElement);
  const updateElementStyle = useBuilderStore((s) => s.updateElementStyle);
  const removeElement = useBuilderStore((s) => s.removeElement);
  const bringToFront = useBuilderStore((s) => s.bringToFront);
  const sendToBack = useBuilderStore((s) => s.sendToBack);
  const seo = useBuilderStore((s) => s.seo);
  const setSEO = useBuilderStore((s) => s.setSEO);

  const selected = useMemo(() => elements.find((el) => el.id === selectedId), [elements, selectedId]);

  if (!selected) {
    return (
      <aside className="h-full overflow-y-auto border-l border-slate-200 bg-slate-50 p-4">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-600">Project settings</h2>

        <label className="mb-2 block text-xs font-medium text-slate-600">SEO Title</label>
        <input
          value={seo.title}
          onChange={(e) => setSEO({ title: e.target.value })}
          className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="My awesome site"
        />

        <label className="mb-2 block text-xs font-medium text-slate-600">SEO Description</label>
        <textarea
          value={seo.description}
          onChange={(e) => setSEO({ description: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          rows={4}
          placeholder="Describe your website for search engines"
        />

        <p className="mt-4 text-xs text-slate-500">Tip: click a component to edit its properties.</p>
      </aside>
    );
  }

  return (
    <aside className="h-full overflow-y-auto border-l border-slate-200 bg-slate-50 p-4">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-600">Element settings</h2>

      <label className="mb-2 block text-xs font-medium text-slate-600">Content</label>
      <textarea
        value={selected.content || ''}
        onChange={(e) => updateElement(selected.id, { content: e.target.value })}
        className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        rows={3}
      />

      {(selected.type === 'button' || selected.type === 'image') && (
        <>
          <label className="mb-2 block text-xs font-medium text-slate-600">
            {selected.type === 'button' ? 'Link (href)' : 'Image URL'}
          </label>
          <input
            value={selected.type === 'button' ? selected.href || '' : selected.content || ''}
            onChange={(e) =>
              selected.type === 'button'
                ? updateElement(selected.id, { href: e.target.value })
                : updateElement(selected.id, { content: e.target.value })
            }
            className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder={selected.type === 'button' ? 'https://...' : 'https://...'}
          />
        </>
      )}

      {selected.type === 'image' && (
        <>
          <label className="mb-2 block text-xs font-medium text-slate-600">Upload image</label>
          <input
            type="file"
            accept="image/*"
            className="mb-3 w-full text-xs"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onload = () => {
                updateElement(selected.id, { content: String(reader.result || '') });
              };
              reader.readAsDataURL(file);
            }}
          />
        </>
      )}

      {selected.type === 'input' && (
        <>
          <label className="mb-2 block text-xs font-medium text-slate-600">Placeholder</label>
          <input
            value={selected.placeholder || ''}
            onChange={(e) => updateElement(selected.id, { placeholder: e.target.value })}
            className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </>
      )}

      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => bringToFront(selected.id)}
            className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs font-medium hover:bg-slate-50"
          >
            Bring Front
          </button>
          <button
            type="button"
            onClick={() => sendToBack(selected.id)}
            className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs font-medium hover:bg-slate-50"
          >
            Send Back
          </button>
        </div>

        {styleFields.map((field) => (
          <div key={field.key}>
            <label className="mb-1 block text-xs font-medium text-slate-600">{field.label}</label>
            <input
              type={field.type || 'text'}
              value={selected.style?.[field.key] || ''}
              onChange={(e) => updateElementStyle(selected.id, { [field.key]: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => removeElement(selected.id)}
        className="mt-6 w-full rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
      >
        Delete Element
      </button>
    </aside>
  );
}
