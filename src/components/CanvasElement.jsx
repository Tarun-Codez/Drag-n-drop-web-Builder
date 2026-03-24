import { useRef } from 'react';
import clsx from 'clsx';
import { useBuilderStore } from '../store/useBuilderStore';

function normalizeHref(href = '') {
  const value = String(href || '').trim();
  if (!value || value === '#') return '#';
  if (/^(https?:\/\/|mailto:|tel:|#)/i.test(value)) return value;
  return `https://${value}`;
}

function splitStyle(style = {}) {
  const frameStyle = {
    position: 'absolute',
    left: style.left || '40px',
    top: style.top || '40px',
    zIndex: Number(style.zIndex || 1),
    width: style.width,
    height: style.height,
  };

  const contentStyle = { ...style };
  delete contentStyle.position;
  delete contentStyle.left;
  delete contentStyle.top;
  delete contentStyle.zIndex;

  return { frameStyle, contentStyle };
}

function renderComponent(element, style) {

  switch (element.type) {
    case 'text':
      return <p style={style}>{element.content}</p>;
    case 'image':
      return <img src={element.content} alt={element.alt || 'user image'} style={style} />;
    case 'button':
      return (
        <a
          href={normalizeHref(element.href)}
          style={{ ...style, textDecoration: 'none' }}
          onClick={(e) => {
            // In editor mode, Ctrl/Cmd+Click opens the link for quick testing.
            if (e.ctrlKey || e.metaKey) {
              const url = normalizeHref(element.href);
              if (url !== '#') window.open(url, '_blank', 'noopener,noreferrer');
              return;
            }
            e.preventDefault();
          }}
          title="Ctrl/Cmd + Click to test link"
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
    case 'container-row':
    case 'container-column':
      return <section style={style}>{element.content}</section>;
    default:
      return <div style={style}>{element.content}</div>;
  }
}

export default function CanvasElement({ element, selected, onSelect }) {
  const dragStartRef = useRef(null);
  const resizeStartRef = useRef(null);

  const updateElementStyleLive = useBuilderStore((s) => s.updateElementStyleLive);
  const recordHistory = useBuilderStore((s) => s.recordHistory);

  const { frameStyle, contentStyle } = splitStyle(element.style || {});

  const beginMove = (e) => {
    if (e.button !== 0) return;
    if (e.target.dataset.resizeHandle === 'true') return;

    e.preventDefault();
    onSelect();
    recordHistory();

    const startX = e.clientX;
    const startY = e.clientY;
    const baseLeft = parseInt(element.style?.left || '0', 10) || 0;
    const baseTop = parseInt(element.style?.top || '0', 10) || 0;
    dragStartRef.current = { startX, startY, baseLeft, baseTop };

    const onMouseMove = (moveEvent) => {
      if (!dragStartRef.current) return;
      const dx = moveEvent.clientX - dragStartRef.current.startX;
      const dy = moveEvent.clientY - dragStartRef.current.startY;
      updateElementStyleLive(element.id, {
        left: `${Math.max(0, dragStartRef.current.baseLeft + dx)}px`,
        top: `${Math.max(0, dragStartRef.current.baseTop + dy)}px`,
      });
    };

    const onMouseUp = () => {
      dragStartRef.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const beginResize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    recordHistory();

    const startX = e.clientX;
    const startY = e.clientY;
    const baseWidth = parseInt(element.style?.width || '260', 10) || 260;
    const baseHeight = parseInt(element.style?.height || '120', 10) || 120;
    resizeStartRef.current = { startX, startY, baseWidth, baseHeight };

    const onMouseMove = (moveEvent) => {
      if (!resizeStartRef.current) return;
      const dx = moveEvent.clientX - resizeStartRef.current.startX;
      const dy = moveEvent.clientY - resizeStartRef.current.startY;
      updateElementStyleLive(element.id, {
        width: `${Math.max(80, resizeStartRef.current.baseWidth + dx)}px`,
        height: `${Math.max(40, resizeStartRef.current.baseHeight + dy)}px`,
      });
    };

    const onMouseUp = () => {
      resizeStartRef.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      style={frameStyle}
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={beginMove}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSelect();
      }}
      className={clsx(
        'group relative cursor-move rounded-xl border bg-white transition',
        selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200 hover:border-slate-300',
      )}
    >
      {renderComponent(element, contentStyle)}

      <button
        type="button"
        aria-label="Resize element"
        data-resize-handle="true"
        onMouseDown={beginResize}
        className="absolute -bottom-2 -right-2 h-4 w-4 cursor-se-resize rounded-sm border border-blue-500 bg-blue-100"
      />
    </div>
  );
}
