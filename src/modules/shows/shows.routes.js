const express = require('express');
const { getShowtimes, getShowtime, createShowtime, updateShowtime, deleteShowtime } = require('./shows.controller');
const { protect, restrictTo } = require('../../middlewares/auth');

const router = express.Router();

router.get('/', getShowtimes);
router.get('/:id', getShowtime);

// Admin routes
router.post('/', protect, restrictTo('ADMIN', 'SUPERADMIN'), createShowtime);
router.put('/:id', protect, restrictTo('ADMIN', 'SUPERADMIN'), updateShowtime);
router.delete('/:id', protect, restrictTo('ADMIN', 'SUPERADMIN'), deleteShowtime);

module.exports = router;
