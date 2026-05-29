const express = require('express');
const { protect } = require('../../middlewares/auth');
const {
  getWatchlist,
  getFavoriteWatchlist,
  addToWatchlist,
  updateWatchlist,
  removeFromWatchlist,
} = require('./watchlist.controller');

const router = express.Router();

router.use(protect);
router.get('/', getWatchlist);
router.get('/favorites', getFavoriteWatchlist);
router.post('/', addToWatchlist);
router.put('/:id', updateWatchlist);
router.delete('/:id', removeFromWatchlist);

module.exports = router;
