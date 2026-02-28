const express = require('express');
const router = express.Router();
const water = require('../controllers/waterController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', water.getAnomalies);
router.put('/:id/resolve', water.resolveAnomaly);

module.exports = router;
