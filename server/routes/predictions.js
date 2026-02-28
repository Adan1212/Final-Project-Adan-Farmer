const express = require('express');
const router = express.Router();
const water = require('../controllers/waterController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', water.getPredictions);
router.post('/generate', water.generatePrediction);
router.get('/comparison', water.getComparison);

module.exports = router;
