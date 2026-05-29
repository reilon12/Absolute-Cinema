const express = require('express');
const { protect } = require('../../middlewares/auth');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('./events.controller');

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', protect, createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);

module.exports = router;
