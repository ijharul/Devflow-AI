const router = require('express').Router();
const { body } = require('express-validator');
const { analyze } = require('../controllers/codeAnalyzerController');
const { protect } = require('../middleware/authMiddleware');

router.post(
  '/analyze',
  protect,
  [
    body('code').trim().notEmpty().withMessage('Code is required').isLength({ max: 10000 }),
    body('language').optional().trim(),
  ],
  analyze
);

module.exports = router;
