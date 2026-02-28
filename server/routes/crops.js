const express = require('express');
const router = express.Router();
const { getCrops, getCrop, createCrop, updateCrop, deleteCrop } = require('../controllers/cropController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getCrops)
    .post(createCrop);

router.route('/:id')
    .get(getCrop)
    .put(updateCrop)
    .delete(deleteCrop);

module.exports = router;
