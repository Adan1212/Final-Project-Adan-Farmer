const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sheepId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sheep',
        required: [true, 'Please link to a sheep']
    },
    vaccineName: {
        type: String,
        required: [true, 'Please add vaccine name'],
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Please add vaccination date'],
        default: Date.now
    },
    nextDueDate: {
        type: Date
    },
    veterinarian: {
        type: String,
        default: ''
    },
    batchNumber: {
        type: String,
        default: ''
    },
    cost: {
        type: Number,
        default: 0
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

module.exports = mongoose.model('Vaccination', vaccinationSchema);
