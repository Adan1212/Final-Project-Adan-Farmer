const express = require('express');
const router = express.Router();
const { getFields, getField, createField, updateField, deleteField } = require('../controllers/fieldController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getFields)
    .post(createField);

router.route('/:id')
    .get(getField)
    .put(updateField)
    .delete(deleteField);

module.exports = router;
