const { validationResult } = require('express-validator');
const { callGroq } = require('../services/aiService');
const { buildSystemDesignPrompt } = require('../services/promptTemplates');
const History = require('../models/History');

const generate = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { prompt } = req.body;
    const { system, user } = buildSystemDesignPrompt(prompt);

    const raw = await callGroq(user, system, [], true);

    let result;
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON object found in response');
      result = JSON.parse(match[0]);
      
      // Auto-correct common Mermaid syntax errors caused by AI hallucinations
      if (result.mermaidDiagram) {
        result.mermaidDiagram = result.mermaidDiagram
          .replace(/\|>/g, '|') // Fix invalid arrows like `-->|Text|>` 
          .replace(/;\s*/g, '\n') // Replace semicolons with newlines for better rendering
          .replace(/->>/g, '-->'); // Fix sequence diagram arrows used in graph by mistake
      }
    } catch (err) {
      console.error('JSON Parse Error:', err);
      console.error('Raw AI Response:', raw);
      return res.status(502).json({ success: false, message: 'AI returned malformed response. Please try again.' });
    }

    // Save to history (non-blocking — don't fail the request if this errors)
    History.create({ user: req.user.id, type: 'system-design', prompt, result }).catch(() => {});

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const history = await History.find({ user: req.user.id, type: 'system-design' })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('prompt result.title createdAt');
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
};

module.exports = { generate, getHistory };
