const { validationResult } = require('express-validator');
const { callGroq } = require('../services/aiService');
const { buildDevOpsPrompt } = require('../services/promptTemplates');
const History = require('../models/History');

const generate = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { appType, framework } = req.body;
    const { system, user } = buildDevOpsPrompt(appType, framework);

    const raw = await callGroq(user, system, [], true);

    let result;
    try {
      // Extract JSON object from response (handles any extra surrounding text)
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON object found in response');
      
      // Parse the JSON
      result = JSON.parse(match[0]);
      
      // Ensure all file content strings have real newlines (convert \n literals)
      ['dockerfile', 'dockerCompose', 'githubActionsYaml'].forEach(key => {
        if (result[key] && typeof result[key] === 'string') {
          result[key] = result[key].replace(/\\n/g, '\n');
        }
      });
    } catch (err) {
      console.error('JSON Parse Error:', err.message);
      console.error('Raw AI Response (first 500 chars):', raw.slice(0, 500));
      return res.status(502).json({ success: false, message: 'AI returned malformed response. Please try again.' });
    }

    History.create({ user: req.user.id, type: 'devops', title: `${appType} Pipeline`, prompt: `${appType} ${framework || ''}`.trim(), result }).catch(() => {});

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { generate };
