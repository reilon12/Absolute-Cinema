const express = require('express');
const { protect } = require('../../middlewares/auth');
const { getRecommendations } = require('./recommendations.controller');

const router = express.Router();
router.get('/', protect, getRecommendations);

module.exports = router;
