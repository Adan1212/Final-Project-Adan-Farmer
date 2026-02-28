const express = require('express');
const router = express.Router();
const { getTreatments, createTreatment, updateTreatment, deleteTreatment } = require('../controllers/treatmentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getTreatments)
    .post(createTreatment);

router.route('/:id')
    .put(updateTreatment)
    .delete(deleteTreatment);

module.exports = router;
