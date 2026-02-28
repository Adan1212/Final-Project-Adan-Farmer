const express = require('express');
const router = express.Router();
const { getSheep, getSheepById, createSheep, updateSheep, deleteSheep, getWeightHistory } = require('../controllers/sheepController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getSheep)
    .post(createSheep);

router.route('/:id')
    .get(getSheepById)
    .put(updateSheep)
    .delete(deleteSheep);

router.get('/:id/weight-history', getWeightHistory);

module.exports = router;
