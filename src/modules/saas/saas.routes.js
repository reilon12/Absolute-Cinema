const express = require('express');
const { getCinemas, createCinema } = require('./saas.controller');

const router = express.Router();

router.get('/cinemas', getCinemas);
router.post('/cinemas', createCinema);

module.exports = router;
