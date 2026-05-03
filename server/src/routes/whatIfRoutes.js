const { Router } = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { analyze } = require('../controllers/whatIfController');

const router = Router();

router.post(
  '/analyze',
  protect,
  [
    body('scenario').trim().notEmpty().isLength({ max: 1000 }),
    body('currentSystem').optional().isLength({ max: 3000 }),
    body('history').optional().isArray(),
  ],
  analyze
);

module.exports = router;
