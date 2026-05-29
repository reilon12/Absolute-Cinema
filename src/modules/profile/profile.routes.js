const express = require('express');
const { protect } = require('../../middlewares/auth');
const {
  getMyProfile,
  getMyStats,
  getMyRewards,
  redeemReward,
} = require('./profile.controller');

const router = express.Router();
router.use(protect);
router.get('/me', getMyProfile);
router.get('/me/stats', getMyStats);
router.get('/me/rewards', getMyRewards);
router.post('/me/redeem/:rewardId', redeemReward);

module.exports = router;
