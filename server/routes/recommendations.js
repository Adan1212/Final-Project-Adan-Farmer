const express = require('express');
const router = express.Router();
const water = require('../controllers/waterController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', water.getRecommendations);
router.put('/:id', water.updateRecommendation);

module.exports = router;
