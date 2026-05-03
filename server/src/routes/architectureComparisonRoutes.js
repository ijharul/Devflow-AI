const { Router } = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { compare } = require('../controllers/architectureComparisonController');

const router = Router();

router.post(
  '/compare',
  protect,
  [
    body('archA').trim().notEmpty().isLength({ max: 2000 }),
    body('archB').trim().notEmpty().isLength({ max: 2000 }),
    body('context').optional().isLength({ max: 1000 }),
  ],
  compare
);

module.exports = router;
