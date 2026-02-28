const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fieldId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Field',
        required: [true, 'Please link to a field']
    },
    cropType: {
        type: String,
        required: [true, 'Please add crop type'],
        trim: true
    },
    variety: {
        type: String,
        default: ''
    },
    growthStage: {
        type: String,
        enum: ['seedling', 'vegetative', 'flowering', 'fruiting', 'maturity', 'harvest_ready'],
        default: 'seedling'
    },
    plantingDate: {
        type: Date,
        required: [true, 'Please add planting date']
    },
    expectedHarvestDate: {
        type: Date
    },
    actualHarvestDate: {
        type: Date
    },
    expectedYield: {
        type: Number,
        default: 0
    },
    actualYield: {
        type: Number,
        default: 0
    },
    yieldUnit: {
        type: String,
        default: 'kg'
    },
    waterRequirement: {
        type: Number, // liters per dunam per day
        default: 0
    },
    status: {
        type: String,
        enum: ['growing', 'harvested', 'failed', 'planned'],
        default: 'growing'
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

module.exports = mongoose.model('Crop', cropSchema);
