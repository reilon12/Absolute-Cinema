const express = require('express');
const { protect } = require('../../middlewares/auth');
const {
  getRequests,
  createRequest,
  voteRequest,
} = require('./requests.controller');

const router = express.Router();

router.get('/', getRequests);
router.post('/', protect, createRequest);
router.post('/vote/:id', protect, voteRequest);

module.exports = router;
