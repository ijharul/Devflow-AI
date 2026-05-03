const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['system-design', 'devops', 'chat', 'code-analyzer', 'error-debug', 'interview', 'whatif', 'comparison'],
      required: true,
    },
    title: {
      type: String,
      maxlength: 200,
    },
    prompt: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    starred: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

historySchema.index({ user: 1, createdAt: -1 });
historySchema.index({ user: 1, starred: 1, createdAt: -1 });

module.exports = mongoose.model('History', historySchema);
