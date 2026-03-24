import { v4 as uuidv4 } from 'uuid';

export const COMPONENT_LIBRARY = [
  { type: 'text', label: 'Text' },
  { type: 'image', label: 'Image' },
  { type: 'button', label: 'Button' },
  { type: 'form', label: 'Form' },
  { type: 'input', label: 'Input Field' },
  { type: 'navbar', label: 'Navbar' },
  { type: 'footer', label: 'Footer' },
  { type: 'container-row', label: 'Container Row' },
  { type: 'container-column', label: 'Container Column' },
];

const commonStyle = {
  position: 'absolute',
  left: '40px',
  top: '40px',
  zIndex: '1',
  fontSize: '16px',
  color: '#111827',
  padding: '12px',
  margin: '0px',
  textAlign: 'left',
  backgroundColor: '#ffffff',
  borderRadius: '6px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '#d1d5db',
  width: '260px',
  height: 'auto',
};

const defaultsByType = {
  text: {
    content: 'Edit this text',
    style: { ...commonStyle, borderWidth: '0px' },
  },
  image: {
    content: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200',
    alt: 'Sample image',
    style: { ...commonStyle, padding: '0px', height: '220px', objectFit: 'cover', width: '320px' },
  },
  button: {
    content: 'Click me',
    href: '#',
    style: {
      ...commonStyle,
      color: '#ffffff',
      backgroundColor: '#2563eb',
      textAlign: 'center',
      width: '180px',
      display: 'inline-block',
      padding: '10px 18px',
      borderColor: '#2563eb',
    },
  },
  form: {
    content: 'Contact Form',
    style: {
      ...commonStyle,
      backgroundColor: '#f9fafb',
      borderColor: '#e5e7eb',
      padding: '16px',
    },
  },
  input: {
    placeholder: 'Type here...',
    content: '',
    style: { ...commonStyle, backgroundColor: '#ffffff' },
  },
  navbar: {
    content: 'Brand | Home | About | Contact',
    style: {
      ...commonStyle,
      backgroundColor: '#111827',
      color: '#ffffff',
      borderWidth: '0px',
      padding: '16px',
      textAlign: 'center',
    },
  },
  footer: {
    content: '© 2026 Your Brand. All rights reserved.',
    style: {
      ...commonStyle,
      backgroundColor: '#111827',
      color: '#ffffff',
      borderWidth: '0px',
      textAlign: 'center',
    },
  },
  'container-row': {
    content: 'Row Container',
    style: {
      ...commonStyle,
      display: 'flex',
      gap: '12px',
      flexDirection: 'row',
      minHeight: '80px',
      width: '420px',
      backgroundColor: '#f3f4f6',
      borderStyle: 'dashed',
      borderColor: '#9ca3af',
    },
  },
  'container-column': {
    content: 'Column Container',
    style: {
      ...commonStyle,
      display: 'flex',
      gap: '12px',
      flexDirection: 'column',
      minHeight: '80px',
      width: '420px',
      backgroundColor: '#f3f4f6',
      borderStyle: 'dashed',
      borderColor: '#9ca3af',
    },
  },
};

export function createNewElement(type) {
  const base = defaultsByType[type] || defaultsByType.text;
  return {
    id: uuidv4(),
    type,
    content: base.content || '',
    href: base.href || '',
    alt: base.alt || '',
    placeholder: base.placeholder || '',
    style: { ...base.style },
  };
}

export const TEMPLATES = [
  {
    id: 'landing-page',
    name: 'Simple Landing Page',
    elements: [
      createNewElement('navbar'),
      { ...createNewElement('text'), content: 'Build websites fast with drag and drop', style: { ...commonStyle, fontSize: '34px', fontWeight: '700', textAlign: 'center', borderWidth: '0px', margin: '24px 0px' } },
      { ...createNewElement('button'), content: 'Get Started' },
      createNewElement('footer'),
    ],
  },
  {
    id: 'contact-page',
    name: 'Contact Page',
    elements: [
      createNewElement('navbar'),
      { ...createNewElement('text'), content: 'Contact Us', style: { ...commonStyle, fontSize: '32px', fontWeight: '700', textAlign: 'center', borderWidth: '0px' } },
      createNewElement('form'),
      createNewElement('footer'),
    ],
  },
];
