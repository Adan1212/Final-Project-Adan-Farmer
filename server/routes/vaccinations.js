const express = require('express');
const router = express.Router();
const { getVaccinations, getUpcomingVaccinations, createVaccination, updateVaccination, deleteVaccination } = require('../controllers/vaccinationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/upcoming', getUpcomingVaccinations);

router.route('/')
    .get(getVaccinations)
    .post(createVaccination);

router.route('/:id')
    .put(updateVaccination)
    .delete(deleteVaccination);

module.exports = router;
