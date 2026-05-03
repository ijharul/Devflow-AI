const { validationResult } = require('express-validator');
const { callGroq } = require('../services/aiService');
const { buildInterviewQuestionPrompt, buildInterviewEvaluatePrompt } = require('../services/promptTemplates');
const History = require('../models/History');

const getQuestion = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { topic, level, previousQuestions = [] } = req.body;

    const { system, user } = buildInterviewQuestionPrompt(topic, level, previousQuestions);

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

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const evaluateAnswer = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { topic, level, question, answer } = req.body;

    const { system, user } = buildInterviewEvaluatePrompt(topic, question, answer, level);

    const raw = await callGroq(user, system, [], true);

    let evaluation;
    try {
      const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
      evaluation = JSON.parse(cleaned);
    } catch {
      return res.status(502).json({ success: false, message: 'AI returned malformed response. Please try again.' });
    }

    History.create({
      user: req.user.id,
      type: 'interview',
      title: `${topic} – ${level}`,
      prompt: question,
      result: evaluation,
    }).catch(() => {});

    res.json({ success: true, data: evaluation });
  } catch (err) {
    next(err);
  }
};

module.exports = { getQuestion, evaluateAnswer };
