const express = require('express');
const { protect } = require('../../middlewares/auth');
const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  likeReview,
} = require('./reviews.controller');

const router = express.Router();

router.get('/', getReviews);
router.get('/:id', getReview);
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/like', protect, likeReview);

module.exports = router;
