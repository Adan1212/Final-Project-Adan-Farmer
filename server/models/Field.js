const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please add a field name'],
        trim: true
    },
    size: {
        type: Number,
        required: [true, 'Please add field size']
    },
    sizeUnit: {
        type: String,
        enum: ['dunam', 'hectare', 'acre'],
        default: 'dunam'
    },
    location: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String }
    },
    soilType: {
        type: String,
        enum: ['clay', 'sandy', 'loamy', 'silt', 'peat', 'chalky', 'other'],
        default: 'loamy'
    },
    status: {
        type: String,
        enum: ['active', 'fallow', 'preparation', 'harvested'],
        default: 'active'
    },
    irrigationType: {
        type: String,
        enum: ['drip', 'sprinkler', 'flood', 'center_pivot', 'none'],
        default: 'drip'
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

module.exports = mongoose.model('Field', fieldSchema);
