const express = require('express');
const router = express.Router();
const { getBirths, createBirth, updateBirth, deleteBirth } = require('../controllers/birthController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getBirths)
    .post(createBirth);

router.route('/:id')
    .put(updateBirth)
    .delete(deleteBirth);

module.exports = router;
