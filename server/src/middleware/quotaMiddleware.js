const User = require('../models/User');

const AI_DAILY_LIMIT = 20;

const checkQuota = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const today = new Date().toISOString().split('T')[0];
    const lastDate = user.lastAiUsageDate ? user.lastAiUsageDate.toISOString().split('T')[0] : '';

    // Reset if it's a new day
    if (today !== lastDate) {
      user.aiUsageCount = 0;
      user.lastAiUsageDate = new Date();
    }

    if (user.aiUsageCount >= AI_DAILY_LIMIT) {
      return res.status(429).json({ 
        success: false, 
        message: `Daily AI quota reached (${AI_DAILY_LIMIT}/day). Please try again tomorrow.` 
      });
    }

    // Increment count
    user.aiUsageCount += 1;
    await user.save();

    next();
  } catch (err) {
    console.error('[Quota Middleware] Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error checking quota' });
  }
};

module.exports = { checkQuota };
