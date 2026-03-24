const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const Project = require('../models/Project');
const { memoryStore } = require('../store/memoryStore');

function toSlug(input) {
  return String(input || 'builder-site')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

async function deployWithVercel({ projectName, codeBundle }) {
  const token = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  const configuredProjectId = process.env.VERCEL_PROJECT_ID;

  if (!token) {
    return { success: false, reason: 'VERCEL_TOKEN is missing.' };
  }

  if (!codeBundle?.html || !codeBundle?.css || !codeBundle?.js) {
    return { success: false, reason: 'Missing code bundle payload.' };
  }

  const name = toSlug(projectName || `site-${nanoid(6)}`);
  const query = teamId ? `?teamId=${teamId}` : '';

  const payload = {
    name,
    files: [
      { file: 'index.html', data: codeBundle.html },
      { file: 'styles.css', data: codeBundle.css },
      { file: 'script.js', data: codeBundle.js },
    ],
    projectSettings: {
      framework: null,
      outputDirectory: null,
      rootDirectory: null,
    },
  };

  if (configuredProjectId) {
    payload.project = configuredProjectId;
  }

  const response = await fetch(`https://api.vercel.com/v13/deployments${query}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `Vercel API error (${response.status})`;
    return { success: false, reason: message };
  }

  const data = await response.json();
  const deploymentUrl = data?.url ? `https://${data.url}` : '';

  if (!deploymentUrl) {
    return { success: false, reason: 'Deployment created but no URL returned.' };
  }

  return { success: true, url: deploymentUrl, provider: 'Vercel' };
}

async function listProjects(req, res) {
  const userId = req.user.id;

  if (mongoose.connection.readyState === 1) {
    const projects = await Project.find({ userId }).sort({ updatedAt: -1 }).lean();
    return res.json(projects);
  }

  const projects = memoryStore.projects
    .filter((p) => p.userId === userId)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  return res.json(projects);
}

async function getProject(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  if (mongoose.connection.readyState === 1) {
    const project = await Project.findOne({ _id: id, userId });
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    return res.json(project);
  }

  const project = memoryStore.projects.find((p) => p.id === id && p.userId === userId);
  if (!project) return res.status(404).json({ message: 'Project not found.' });
  return res.json(project);
}

async function saveProject(req, res) {
  const userId = req.user.id;
  const { id, name, schema, seo } = req.body;

  if (!name || !schema) {
    return res.status(400).json({ message: 'Project name and schema are required.' });
  }

  if (mongoose.connection.readyState === 1) {
    let project;

    if (id) {
      project = await Project.findOneAndUpdate(
        { _id: id, userId },
        { name, schema, seo },
        { new: true }
      );
    }

    if (!project) {
      project = await Project.create({ userId, name, schema, seo });
    }

    return res.json(project);
  }

  const now = new Date().toISOString();
  let project = memoryStore.projects.find((p) => p.id === id && p.userId === userId);

  if (project) {
    project.name = name;
    project.schema = schema;
    project.seo = seo || { title: '', description: '' };
    project.updatedAt = now;
  } else {
    project = {
      id: `p_${Date.now()}`,
      userId,
      name,
      schema,
      seo: seo || { title: '', description: '' },
      publishedUrl: '',
      createdAt: now,
      updatedAt: now,
    };
    memoryStore.projects.push(project);
  }

  return res.json(project);
}

async function publishProject(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  const { codeBundle } = req.body || {};

  // Try real one-click deployment first (Vercel), then fallback to simulated URL.
  const vercelResult = await deployWithVercel({
    projectName: `site-${id}`,
    codeBundle,
  });

  const generatedUrl = vercelResult.success
    ? vercelResult.url
    : `https://site-${nanoid(8)}.builder-demo.app`;

  if (mongoose.connection.readyState === 1) {
    const project = await Project.findOneAndUpdate(
      { _id: id, userId },
      { publishedUrl: generatedUrl },
      { new: true }
    );

    if (!project) return res.status(404).json({ message: 'Project not found.' });
    return res.json({
      url: generatedUrl,
      project,
      provider: vercelResult.success ? vercelResult.provider : 'simulation',
      deploymentNote: vercelResult.success ? undefined : vercelResult.reason,
    });
  }

  const project = memoryStore.projects.find((p) => p.id === id && p.userId === userId);
  if (!project) return res.status(404).json({ message: 'Project not found.' });

  project.publishedUrl = generatedUrl;
  project.updatedAt = new Date().toISOString();

  return res.json({
    url: generatedUrl,
    project,
    provider: vercelResult.success ? vercelResult.provider : 'simulation',
    deploymentNote: vercelResult.success ? undefined : vercelResult.reason,
  });
}

module.exports = {
  listProjects,
  getProject,
  saveProject,
  publishProject,
};
