const express = require('express');
const router = express.Router();
const water = require('../controllers/waterController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', water.getWeatherData);
router.post('/', water.createWeatherData);

module.exports = router;
