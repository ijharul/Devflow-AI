const { Router } = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { getQuestion, evaluateAnswer } = require('../controllers/interviewController');

const router = Router();

router.post(
  '/question',
  protect,
  [
    body('topic').trim().notEmpty(),
    body('level').trim().notEmpty(),
    body('previousQuestions').optional().isArray(),
  ],
  getQuestion
);

router.post(
  '/evaluate',
  protect,
  [
    body('topic').trim().notEmpty(),
    body('level').trim().notEmpty(),
    body('question').trim().notEmpty(),
    body('answer').trim().notEmpty().isLength({ max: 5000 }),
  ],
  evaluateAnswer
);

module.exports = router;
