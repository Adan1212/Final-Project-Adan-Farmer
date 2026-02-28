const express = require('express');
const router = express.Router();
const water = require('../controllers/waterController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Water readings
router.route('/').get(water.getWaterReadings).post(water.createWaterReading);
router.get('/summary', water.getWaterSummary);
router.get('/savings', water.getCostSavings);
router.route('/:id').put(water.updateWaterReading).delete(water.deleteWaterReading);

module.exports = router;
