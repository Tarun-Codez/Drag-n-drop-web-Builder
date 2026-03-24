// In-memory fallback store (useful when MongoDB is not configured).
// This keeps the demo usable out-of-the-box.
const memoryStore = {
  users: [],
  projects: [],
  published: [],
};

module.exports = { memoryStore };
