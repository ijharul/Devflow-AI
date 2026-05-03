const router = require('express').Router();
const { body } = require('express-validator');
const { generate, getHistory } = require('../controllers/systemDesignController');
const { protect } = require('../middleware/authMiddleware');
const { checkQuota } = require('../middleware/quotaMiddleware');

router.post(
  '/generate',
  protect,
  checkQuota,
  [body('prompt').trim().notEmpty().withMessage('Prompt is required').isLength({ max: 500 })],
  generate
);

router.get('/history', protect, getHistory);

module.exports = router;
