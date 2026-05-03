const router = require('express').Router();
const { body } = require('express-validator');
const { generate } = require('../controllers/devopsController');
const { protect } = require('../middleware/authMiddleware');

router.post(
  '/generate',
  protect,
  [
    body('appType').trim().notEmpty().withMessage('App type is required'),
    body('framework').optional().trim(),
  ],
  generate
);

module.exports = router;
