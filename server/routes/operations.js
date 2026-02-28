const express = require('express');
const router = express.Router();
const { getOperations, getOperation, createOperation, updateOperation, deleteOperation } = require('../controllers/operationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getOperations)
    .post(createOperation);

router.route('/:id')
    .get(getOperation)
    .put(updateOperation)
    .delete(deleteOperation);

module.exports = router;
