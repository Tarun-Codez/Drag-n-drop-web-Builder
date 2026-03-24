import { useBuilderStore } from '../store/useBuilderStore';

function normalizeHref(href = '') {
  const value = String(href || '').trim();
  if (!value || value === '#') return '#';
  if (/^(https?:\/\/|mailto:|tel:|#)/i.test(value)) return value;
  return `https://${value}`;
}

function getContentStyle(style = {}) {
  const contentStyle = { ...style };
  delete contentStyle.position;
  delete contentStyle.left;
  delete contentStyle.top;
  delete contentStyle.zIndex;
  return contentStyle;
}

function getFrameStyle(style = {}) {
  return {
    position: 'absolute',
    left: style.left || '0px',
    top: style.top || '0px',
    zIndex: Number(style.zIndex || 1),
    width: style.width,
    height: style.height,
  };
}

function renderElement(element) {
  const style = getContentStyle(element.style || {});

  switch (element.type) {
    case 'text':
      return <p style={style}>{element.content}</p>;
    case 'image':
      return <img src={element.content} alt={element.alt || 'image'} style={style} />;
    case 'button':
      return (
        <a
          href={normalizeHref(element.href)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...style, textDecoration: 'none' }}
        >
          {element.content}
        </a>
      );
    case 'input':
      return <input placeholder={element.placeholder} style={style} readOnly />;
    case 'form':
      return (
        <form style={style} onSubmit={(e) => e.preventDefault()}>
          <h3 className="mb-2 font-semibold">{element.content || 'Form'}</h3>
          <input className="mb-2 w-full rounded border p-2" placeholder="Name" />
          <input className="mb-2 w-full rounded border p-2" placeholder="Email" />
          <button className="rounded bg-blue-600 px-3 py-2 text-white">Submit</button>
        </form>
      );
    case 'navbar':
      return <nav style={style}>{element.content}</nav>;
    case 'footer':
      return <footer style={style}>{element.content}</footer>;
    default:
      return <div style={style}>{element.content}</div>;
  }
}

export default function LivePreview({ onClose }) {
  const elements = useBuilderStore((s) => s.elements);
  const viewMode = useBuilderStore((s) => s.viewMode);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/55 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-4">
        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-lg font-semibold">Live Preview</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className={`mx-auto rounded-xl border border-slate-200 bg-slate-50 p-4 ${viewMode === 'mobile' ? 'w-[390px]' : 'w-full'}`}>
          <div className="relative min-h-[66vh] overflow-hidden rounded-xl bg-white p-3">
            {elements.length ? (
              elements
                .slice()
                .sort((a, b) => Number(a.style?.zIndex || 1) - Number(b.style?.zIndex || 1))
                .map((element) => (
                  <div key={element.id} style={getFrameStyle(element.style || {})}>
                    {renderElement(element)}
                  </div>
                ))
            ) : (
              <div className="rounded border border-dashed border-slate-300 p-8 text-center text-slate-400">
                Add components to see your preview.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
