const mongoose = require('mongoose');

const waterReadingSchema = new mongoose.Schema({
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
    date: {
        type: Date,
        required: [true, 'Please add reading date'],
        default: Date.now
    },
    actualConsumption: {
        type: Number,
        required: [true, 'Please add water consumption']
    },
    unit: {
        type: String,
        enum: ['liters', 'cubic_meters', 'gallons'],
        default: 'cubic_meters'
    },
    source: {
        type: String,
        enum: ['manual', 'sensor', 'meter'],
        default: 'manual'
    },
    readingType: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'daily'
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

module.exports = mongoose.model('WaterReading', waterReadingSchema);
