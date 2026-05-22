const express = require('express');
const { getMovies, getMovie, createMovie, updateMovie, deleteMovie } = require('./movies.controller');
const { protect, restrictTo } = require('../../middlewares/auth');

const router = express.Router();

router.get('/', getMovies);
router.get('/:id', getMovie);

// Admin routes
router.post('/', protect, restrictTo('ADMIN', 'SUPERADMIN'), createMovie);
router.put('/:id', protect, restrictTo('ADMIN', 'SUPERADMIN'), updateMovie);
router.delete('/:id', protect, restrictTo('ADMIN', 'SUPERADMIN'), deleteMovie);

module.exports = router;
