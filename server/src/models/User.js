const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 50 },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Valid email required'] },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    googleId: { type: String, select: false },
    githubId: { type: String, select: false },
    githubAccessToken: { type: String, select: false },
    githubUsername: { type: String, default: null },
    avatar: { type: String, default: null },
    aiUsageCount: { type: Number, default: 0 },
    lastAiUsageDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
