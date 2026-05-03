const { validationResult } = require('express-validator');
const { callGroq } = require('../services/aiService');
const { buildArchitectureComparisonPrompt } = require('../services/promptTemplates');
const History = require('../models/History');

const compare = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { archA, archB, context } = req.body;

    const prompt = buildArchitectureComparisonPrompt(archA, archB, context);

    const raw = await callGroq(prompt.user, prompt.system);

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

    History.create({
      user: req.user.id,
      type: 'comparison',
      title: `${archA.slice(0, 40)} vs ${archB.slice(0, 40)}`,
      prompt: `${archA} vs ${archB}`,
      result,
    }).catch(() => {});

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { compare };
