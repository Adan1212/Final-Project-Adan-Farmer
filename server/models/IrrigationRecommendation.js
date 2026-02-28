const mongoose = require('mongoose');

const irrigationRecommendationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    recommendedAmount: {
        type: Number, // cubic meters
        required: true
    },
    actualAmount: {
        type: Number,
        default: 0
    },
    unit: {
        type: String,
        default: 'cubic_meters'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'applied', 'skipped', 'partial'],
        default: 'pending'
    },
    reasoning: {
        type: String,
        default: ''
    },
    savings: {
        type: Number, // percentage savings vs naive irrigation
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('IrrigationRecommendation', irrigationRecommendationSchema);
