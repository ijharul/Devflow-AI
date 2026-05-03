const History = require('../models/History');

const VALID_TYPES = ['system-design', 'devops', 'chat', 'code-analyzer', 'error-debug', 'interview', 'whatif', 'comparison'];

/**
 * GET /api/history
 * Query params: type, starred, page, limit
 */
const getAll = async (req, res, next) => {
  try {
    const { type = 'all', starred, page = 1, limit = 30 } = req.query;

    const filter = { user: req.user.id };

    if (type !== 'all' && VALID_TYPES.includes(type)) {
      filter.type = type;
    }

    if (starred === 'true') {
      filter.starred = true;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      History.find(filter)
        .select('-result')
        .sort({ starred: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      History.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        items,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/history/:id
 */
const getOne = async (req, res, next) => {
  try {
    const item = await History.findOne({ _id: req.params.id, user: req.user.id });

    if (!item) {
      return res.status(404).json({ success: false, message: 'History item not found.' });
    }

    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/history/:id
 */
const deleteOne = async (req, res, next) => {
  try {
    const item = await History.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!item) {
      return res.status(404).json({ success: false, message: 'History item not found.' });
    }

    res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/history/:id/star
 */
const toggleStar = async (req, res, next) => {
  try {
    const item = await History.findOne({ _id: req.params.id, user: req.user.id });

    if (!item) {
      return res.status(404).json({ success: false, message: 'History item not found.' });
    }

    item.starred = !item.starred;
    await item.save();

    res.json({ success: true, data: { starred: item.starred } });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/history/clear
 * Query params: type (optional)
 * Deletes all non-starred items for the user, optionally filtered by type.
 */
const clearAll = async (req, res, next) => {
  try {
    const { type } = req.query;

    const filter = { user: req.user.id, starred: false };

    if (type && type !== 'all' && VALID_TYPES.includes(type)) {
      filter.type = type;
    }

    const { deletedCount } = await History.deleteMany(filter);

    res.json({ success: true, data: { deletedCount } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, deleteOne, toggleStar, clearAll };
