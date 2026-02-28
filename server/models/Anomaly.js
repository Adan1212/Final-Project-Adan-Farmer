const mongoose = require('mongoose');

const anomalySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    fieldId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Field',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    expectedValue: {
        type: Number,
        required: true
    },
    actualValue: {
        type: Number,
        required: true
    },
    deviationPercent: {
        type: Number,
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true
    },
    type: {
        type: String,
        enum: ['overconsumption', 'underconsumption', 'leak_suspected', 'sensor_error'],
        default: 'overconsumption'
    },
    resolved: {
        type: Boolean,
        default: false
    },
    resolvedAt: {
        type: Date
    },
    notes: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Anomaly', anomalySchema);
