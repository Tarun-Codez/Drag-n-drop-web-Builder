const express = require('express');
const {
  listProjects,
  getProject,
  saveProject,
  publishProject,
} = require('../controllers/projectController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', listProjects);
router.get('/:id', getProject);
router.post('/save', saveProject);
router.post('/:id/publish', publishProject);

module.exports = router;
