const express = require('express');
const { getMyHistory, getSalesDashboard, bookTickets } = require('./tickets.controller');
const { protect, restrictTo } = require('../../middlewares/auth');

const router = express.Router();

router.get('/history', protect, getMyHistory);
router.get('/sales', protect, restrictTo('ADMIN', 'SUPERADMIN'), getSalesDashboard);
router.post('/book', protect, bookTickets);

module.exports = router;
