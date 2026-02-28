const mongoose = require('mongoose');

const operationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fieldId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Field',
        required: true
    },
    cropId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop'
    },
    operationType: {
        type: String,
        enum: ['planting', 'harvesting', 'fertilizing', 'spraying', 'irrigation', 'plowing', 'weeding', 'other'],
        required: [true, 'Please add operation type']
    },
    date: {
        type: Date,
        required: [true, 'Please add operation date'],
        default: Date.now
    },
    notes: {
        type: String,
        default: ''
    },
    materials: {
        type: String,
        default: ''
    },
    quantity: {
        type: Number,
        default: 0
    },
    quantityUnit: {
        type: String,
        default: ''
    },
    cost: {
        type: Number,
        default: 0
    },
    performedBy: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['planned', 'in_progress', 'completed', 'cancelled'],
        default: 'completed'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AgriculturalOperation', operationSchema);
