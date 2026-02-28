const mongoose = require('mongoose');

const sheepSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tagNumber: {
        type: String,
        required: [true, 'Please add a tag number'],
        unique: true,
        trim: true
    },
    name: {
        type: String,
        default: ''
    },
    breed: {
        type: String,
        required: [true, 'Please add breed'],
        trim: true
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: [true, 'Please specify gender']
    },
    birthDate: {
        type: Date,
        required: [true, 'Please add birth date']
    },
    weight: {
        type: Number,
        default: 0
    },
    motherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sheep',
        default: null
    },
    fatherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sheep',
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'sold', 'deceased', 'quarantine'],
        default: 'active'
    },
    healthStatus: {
        type: String,
        enum: ['healthy', 'sick', 'recovering', 'pregnant', 'nursing'],
        default: 'healthy'
    },
    weightHistory: [{
        weight: Number,
        date: { type: Date, default: Date.now }
    }],
    notes: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Sheep', sheepSchema);
