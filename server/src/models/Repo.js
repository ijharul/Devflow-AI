const mongoose = require('mongoose');

const repoSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    repoUrl: { type: String, required: true },
    owner: { type: String, required: true },
    name: { type: String, required: true },
    fullName: { type: String, required: true },
    description: { type: String, default: '' },
    language: { type: String, default: '' },
    stars: { type: Number, default: 0 },
    structure: { type: mongoose.Schema.Types.Mixed },  // file tree
    keyFiles: { type: mongoose.Schema.Types.Mixed },   // content of important files
    systemDesign: { type: mongoose.Schema.Types.Mixed },
    devopsPipeline: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

repoSchema.index({ user: 1, fullName: 1 }, { unique: true });

module.exports = mongoose.model('Repo', repoSchema);
