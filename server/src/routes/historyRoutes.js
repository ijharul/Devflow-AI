const { Router } = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getAll, getOne, deleteOne, toggleStar, clearAll } = require('../controllers/historyController');

const router = Router();

router.use(protect);

// DELETE /clear must be registered before DELETE /:id to avoid route conflict
router.get('/', getAll);
router.delete('/clear', clearAll);
router.get('/:id', getOne);
router.delete('/:id', deleteOne);
router.patch('/:id/star', toggleStar);

module.exports = router;
