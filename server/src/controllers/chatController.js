const { validationResult } = require('express-validator');
const { callGroq } = require('../services/aiService');
const { buildChatSystemPrompt } = require('../services/promptTemplates');

const sendMessage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { message, history = [] } = req.body;

    // Sanitize history — only keep role + content, cap at last 10 messages to control token usage
    const sanitizedHistory = history
      .slice(-10)
      .map(({ role, content }) => ({ role, content }))
      .filter((m) => m.role && m.content);

    const reply = await callGroq(message, buildChatSystemPrompt(), sanitizedHistory);

    res.json({ success: true, data: { reply } });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendMessage };
