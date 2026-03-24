import { Smartphone, Monitor, Save, UploadCloud, Download, Eye, RotateCcw, RotateCw, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { downloadCodeBundle, generateCodeBundle } from '../lib/exporter';
import { fetchProjects, publishProject, saveProject } from '../services/api';
import { useBuilderStore } from '../store/useBuilderStore';

export default function TopBar({ user, onLogout, onPreview }) {
  const {
    elements,
    viewMode,
    setViewMode,
    projectName,
    setProjectName,
    seo,
    currentProjectId,
    loadProject,
    undo,
    redo,
  } = useBuilderStore();

  const save = async () => {
    try {
      const project = await saveProject({
        id: currentProjectId,
        name: projectName,
        seo,
        schema: { elements },
      });
      loadProject(project);
      toast.success('Project saved');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    }
  };

  const loadLatest = async () => {
    try {
      const projects = await fetchProjects();
      if (!projects.length) {
        toast('No saved projects yet');
        return;
      }

      loadProject(projects[0]);
      toast.success(`Loaded: ${projects[0].name}`);
    } catch (error) {
      toast.error('Failed to load projects');
    }
  };

  const publish = async () => {
    try {
      let targetProjectId = currentProjectId;

      // Auto-save first so publish always has a valid project id.
      if (!targetProjectId) {
        const project = await saveProject({ name: projectName, seo, schema: { elements } });
        loadProject(project);
        targetProjectId = project.id || project._id;
      }

      const codeBundle = generateCodeBundle({ name: projectName, seo, schema: { elements } });
      const result = await publishProject(targetProjectId, { codeBundle });
      const providerLabel = result.provider ? ` via ${result.provider}` : '';
      toast.success(`Your site is live${providerLabel} at: ${result.url}`);
      if (result.provider === 'simulation' && result.deploymentNote) {
        toast(result.deploymentNote, { icon: 'ℹ️' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Publish failed');
    }
  };

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="rounded-md bg-blue-50 px-2 py-1 text-sm font-semibold text-blue-700">Builder Pro</span>
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <button type="button" onClick={undo} className="top-btn" title="Undo">
          <RotateCcw size={16} />
        </button>
        <button type="button" onClick={redo} className="top-btn" title="Redo">
          <RotateCw size={16} />
        </button>

        <button
          type="button"
          onClick={() => setViewMode('desktop')}
          className={`top-btn ${viewMode === 'desktop' ? 'bg-blue-50 text-blue-700' : ''}`}
        >
          <Monitor size={16} />
        </button>
        <button
          type="button"
          onClick={() => setViewMode('mobile')}
          className={`top-btn ${viewMode === 'mobile' ? 'bg-blue-50 text-blue-700' : ''}`}
        >
          <Smartphone size={16} />
        </button>

        <button type="button" onClick={loadLatest} className="top-btn">
          <UploadCloud size={16} /> Load
        </button>

        <button type="button" onClick={save} className="top-btn">
          <Save size={16} /> Save
        </button>

        <button
          type="button"
          onClick={() => downloadCodeBundle({ name: projectName, seo, schema: { elements } })}
          className="top-btn"
        >
          <Download size={16} /> Export
        </button>

        <button type="button" onClick={onPreview} className="top-btn">
          <Eye size={16} /> Preview
        </button>

        <button type="button" onClick={publish} className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          Publish
        </button>

        <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-2">
          <span className="text-xs text-slate-500">{user?.name}</span>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('builder_token');
              localStorage.removeItem('builder_user');
              toast('Logged out');
              onLogout();
            }}
            className="top-btn"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
