const router = require('express').Router();
const { body } = require('express-validator');
const { sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const { checkQuota } = require('../middleware/quotaMiddleware');

router.post(
  '/message',
  protect,
  checkQuota,
  [
    body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }),
    body('history').optional().isArray(),
  ],
  sendMessage
);

module.exports = router;
