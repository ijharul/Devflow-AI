const { validationResult } = require('express-validator');
const { callGroq } = require('../services/aiService');
const { buildCodeAnalyzerPrompt } = require('../services/promptTemplates');
const History = require('../models/History');

const analyze = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { code, language } = req.body;
    const { system, user } = buildCodeAnalyzerPrompt(code, language);

    const raw = await callGroq(user, system, [], true);

    let result;
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON object found in response');
      result = JSON.parse(match[0]);
    } catch (err) {
      console.error('JSON Parse Error:', err);
      console.error('Raw AI Response:', raw);
      return res.status(502).json({ success: false, message: 'AI returned malformed response. Please try again.' });
    }

    History.create({ user: req.user.id, type: 'code-analyzer', prompt: code.slice(0, 200), result }).catch(() => {});

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { analyze };
