// Convert the internal JSON schema into clean HTML/CSS/JS files.
function inlineStyle(style = {}) {
  return Object.entries(style)
    .map(([key, value]) => `${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}:${value}`)
    .join(';');
}

function normalizeHref(href = '') {
  const value = String(href || '').trim();
  if (!value || value === '#') return '#';
  if (/^(https?:\/\/|mailto:|tel:|#)/i.test(value)) return value;
  return `https://${value}`;
}

function renderElement(el) {
  const style = inlineStyle({ ...el.style, position: 'absolute' });

  switch (el.type) {
    case 'text':
      return `<p style="${style}">${el.content || ''}</p>`;
    case 'image':
      return `<img src="${el.content || ''}" alt="${el.alt || 'image'}" style="${style}" />`;
    case 'button':
      return `<a href="${normalizeHref(el.href)}" target="_blank" rel="noopener noreferrer" style="${style};text-decoration:none;cursor:pointer;">${el.content || 'Button'}</a>`;
    case 'input':
      return `<input placeholder="${el.placeholder || ''}" style="${style}" />`;
    case 'form':
      return `<form style="${style}"><h3>${el.content || 'Form'}</h3><input placeholder="Name" style="width:100%;padding:10px;margin:8px 0;" /><input placeholder="Email" style="width:100%;padding:10px;margin:8px 0;" /><button style="padding:10px 14px;background:#2563eb;color:white;border:none;border-radius:6px;">Submit</button></form>`;
    case 'navbar':
      return `<nav style="${style}">${el.content || ''}</nav>`;
    case 'footer':
      return `<footer style="${style}">${el.content || ''}</footer>`;
    case 'container-row':
    case 'container-column':
      return `<section style="${style}">${el.content || ''}</section>`;
    default:
      return `<div style="${style}">${el.content || ''}</div>`;
  }
}

export function generateCodeBundle(project) {
  const { name = 'website', seo = {}, schema = { elements: [] } } = project;
  const htmlElements = (schema.elements || []).map(renderElement).join('\n');

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${seo.title || name}</title>
    <meta name="description" content="${seo.description || ''}" />
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="page">\n${htmlElements}\n    </main>
    <script src="script.js"></script>
  </body>
</html>`;

  const css = `.page {\n  position: relative;\n  max-width: 1100px;\n  min-height: 80vh;\n  margin: 0 auto;\n  padding: 20px;\n  font-family: Inter, Arial, sans-serif;\n}\n`;

  const js = `// Add custom interactivity here.\nconsole.log('Site exported from drag-and-drop builder.');\n`;

  return { html, css, js };
}

export function downloadCodeBundle(project) {
  const { html, css, js } = generateCodeBundle(project);

  const files = [
    { name: 'index.html', content: html },
    { name: 'styles.css', content: css },
    { name: 'script.js', content: js },
  ];

  files.forEach((file) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  });
}
