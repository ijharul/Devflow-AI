const router = require('express').Router();
const { body } = require('express-validator');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');
const {
  importRepo, generateSystemDesign, generateDevOps,
  deployChat, listRepos, getRepo, autoGenerate,
} = require('../controllers/githubController');

// ── GitHub OAuth ──────────────────────────────────────────────────────────────
router.get('/auth', passport.authenticate('github', { session: false }));

router.get(
  '/auth/callback',
  passport.authenticate('github', { failureRedirect: `${process.env.CLIENT_URL}/login?error=github_failed`, session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email, name: req.user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?token=${token}&name=${encodeURIComponent(req.user.name)}&email=${encodeURIComponent(req.user.email)}&id=${req.user._id}`
    );
  }
);

// ── Repo APIs (all protected) ─────────────────────────────────────────────────
router.get('/repos', protect, listRepos);

router.post(
  '/repos/import',
  protect,
  [body('repoUrl').trim().notEmpty().withMessage('GitHub repo URL is required')],
  importRepo
);

router.get('/repos/:repoId', protect, getRepo);
router.post('/repos/:repoId/auto-generate', protect, autoGenerate);
router.post('/repos/:repoId/system-design', protect, generateSystemDesign);
router.post('/repos/:repoId/devops', protect, generateDevOps);

router.post(
  '/repos/:repoId/deploy-chat',
  protect,
  [
    body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }),
    body('history').optional().isArray(),
  ],
  deployChat
);

module.exports = router;
