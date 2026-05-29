const express = require('express');
const { protect } = require('../../middlewares/auth');
const {
  getFeed,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
} = require('./social.controller');

const router = express.Router();

router.get('/feed', protect, getFeed);
router.get('/followers', protect, getFollowers);
router.get('/following', protect, getFollowing);
router.post('/follow/:targetId', protect, followUser);
router.post('/unfollow/:targetId', protect, unfollowUser);

module.exports = router;
