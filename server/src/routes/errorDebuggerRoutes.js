const { Router } = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { analyze } = require('../controllers/errorDebuggerController');

const router = Router();

router.post(
  '/analyze',
  protect,
  [
    body('errorMessage').trim().notEmpty().isLength({ max: 3000 }),
    body('code').optional().isLength({ max: 8000 }),
    body('language').optional().trim(),
  ],
  analyze
);

module.exports = router;
