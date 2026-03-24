const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    schema: { type: Object, required: true },
    seo: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
    },
    publishedUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
