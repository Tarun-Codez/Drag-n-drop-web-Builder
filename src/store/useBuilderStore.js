import { create } from 'zustand';
import { createNewElement, TEMPLATES } from '../lib/componentLibrary';

function moveItem(list, fromIndex, toIndex) {
  const newList = [...list];
  const [item] = newList.splice(fromIndex, 1);
  newList.splice(toIndex, 0, item);
  return newList;
}

export const useBuilderStore = create((set, get) => ({
  elements: [],
  selectedId: null,
  viewMode: 'desktop',
  projectName: 'Untitled Project',
  currentProjectId: null,
  seo: { title: '', description: '' },
  canvasRect: null,
  historyPast: [],
  historyFuture: [],

  recordHistory: () => {
    const { elements, projectName, seo, currentProjectId } = get();
    set((state) => ({
      historyPast: [...state.historyPast, { elements, projectName, seo, currentProjectId }],
      historyFuture: [],
    }));
  },

  addElement: (type, options = {}) => {
    get().recordHistory();
    const newElement = createNewElement(type);
    const { clientX = null, clientY = null } = options;
    const { canvasRect, elements } = get();

    // Place new elements close to drop position when available.
    if (canvasRect && typeof clientX === 'number' && typeof clientY === 'number') {
      const left = Math.max(0, Math.round(clientX - canvasRect.left - 30));
      const top = Math.max(0, Math.round(clientY - canvasRect.top - 20));
      newElement.style.left = `${left}px`;
      newElement.style.top = `${top}px`;
    } else {
      // Stagger automatic placement to avoid fully stacked components.
      const offset = 24 * (elements.length % 8);
      newElement.style.left = `${40 + offset}px`;
      newElement.style.top = `${40 + offset}px`;
    }

    newElement.style.zIndex = String(elements.length + 1);

    set((state) => {
      const next = [...state.elements];
      next.push(newElement);
      return { elements: next, selectedId: newElement.id };
    });
  },

  updateElement: (id, updates) => {
    get().recordHistory();
    set((state) => ({
      elements: state.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    }));
  },

  updateElementStyle: (id, stylePatch) => {
    get().recordHistory();
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id
          ? {
              ...el,
              style: { ...el.style, ...stylePatch },
            }
          : el
      ),
    }));
  },

  updateElementStyleLive: (id, stylePatch) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id
          ? {
              ...el,
              style: { ...el.style, ...stylePatch },
            }
          : el
      ),
    }));
  },

  removeElement: (id) => {
    get().recordHistory();
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    }));
  },

  reorderElements: (activeId, overId) => {
    if (!overId || activeId === overId) return;

    get().recordHistory();
    set((state) => {
      const oldIndex = state.elements.findIndex((el) => el.id === activeId);
      const newIndex = state.elements.findIndex((el) => el.id === overId);
      if (oldIndex < 0 || newIndex < 0) return state;

      return { elements: moveItem(state.elements, oldIndex, newIndex) };
    });
  },

  setSelectedId: (selectedId) => set({ selectedId }),
  setViewMode: (viewMode) => set({ viewMode }),
  setProjectName: (projectName) => set({ projectName }),
  setSEO: (seoPatch) => set((state) => ({ seo: { ...state.seo, ...seoPatch } })),
  setCanvasRect: (canvasRect) => set({ canvasRect }),

  bringToFront: (id) => {
    get().recordHistory();
    const maxZ = Math.max(
      1,
      ...get().elements.map((el) => Number(el.style?.zIndex || 1))
    );

    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id
          ? { ...el, style: { ...el.style, zIndex: String(maxZ + 1) } }
          : el
      ),
    }));
  },

  sendToBack: (id) => {
    get().recordHistory();
    const minZ = Math.min(
      1,
      ...get().elements.map((el) => Number(el.style?.zIndex || 1))
    );

    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id
          ? { ...el, style: { ...el.style, zIndex: String(minZ - 1) } }
          : el
      ),
    }));
  },

  loadProject: (project) => {
    set({
      currentProjectId: project.id || project._id || null,
      projectName: project.name || 'Untitled Project',
      seo: project.seo || { title: '', description: '' },
      elements: project.schema?.elements || [],
      selectedId: null,
      historyPast: [],
      historyFuture: [],
    });
  },

  loadTemplate: (templateId) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    get().recordHistory();
    set({ elements: structuredClone(template.elements), selectedId: null });
  },

  undo: () => {
    const { historyPast, historyFuture, elements, projectName, seo, currentProjectId } = get();
    if (!historyPast.length) return;

    const previous = historyPast[historyPast.length - 1];
    set({
      elements: previous.elements,
      projectName: previous.projectName,
      seo: previous.seo,
      currentProjectId: previous.currentProjectId,
      historyPast: historyPast.slice(0, -1),
      historyFuture: [...historyFuture, { elements, projectName, seo, currentProjectId }],
      selectedId: null,
    });
  },

  redo: () => {
    const { historyPast, historyFuture, elements, projectName, seo, currentProjectId } = get();
    if (!historyFuture.length) return;

    const next = historyFuture[historyFuture.length - 1];
    set({
      elements: next.elements,
      projectName: next.projectName,
      seo: next.seo,
      currentProjectId: next.currentProjectId,
      historyFuture: historyFuture.slice(0, -1),
      historyPast: [...historyPast, { elements, projectName, seo, currentProjectId }],
      selectedId: null,
    });
  },

  clearCanvas: () => {
    get().recordHistory();
    set({ elements: [], selectedId: null });
  },
}));
