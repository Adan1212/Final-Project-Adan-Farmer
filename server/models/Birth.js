const mongoose = require('mongoose');

const birthSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    motherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sheep',
        required: [true, 'Please add mother sheep']
    },
    fatherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sheep'
    },
    birthDate: {
        type: Date,
        required: [true, 'Please add birth date'],
        default: Date.now
    },
    lambCount: {
        type: Number,
        required: [true, 'Please add number of lambs'],
        min: 1,
        default: 1
    },
    lambDetails: {
        type: String,
        default: ''
    },
    lambIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sheep'
    }],
    birthType: {
        type: String,
        enum: ['natural', 'assisted', 'cesarean'],
        default: 'natural'
    },
    complications: {
        type: String,
        default: ''
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

module.exports = mongoose.model('Birth', birthSchema);
