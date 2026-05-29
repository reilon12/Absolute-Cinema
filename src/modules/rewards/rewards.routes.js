const express = require('express');
const { protect } = require('../../middlewares/auth');
const { getRewards, redeemReward } = require('./rewards.controller');

const router = express.Router();
router.get('/', getRewards);
router.post('/redeem/:id', protect, redeemReward);

module.exports = router;
