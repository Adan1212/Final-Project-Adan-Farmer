const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema({
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
    diagnosis: {
        type: String,
        required: [true, 'Please add diagnosis'],
        trim: true
    },
    treatment: {
        type: String,
        required: [true, 'Please add treatment details'],
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Please add treatment date'],
        default: Date.now
    },
    cost: {
        type: Number,
        default: 0
    },
    veterinarian: {
        type: String,
        default: ''
    },
    followUpDate: {
        type: Date
    },
    medications: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['ongoing', 'completed', 'follow_up_needed'],
        default: 'ongoing'
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

module.exports = mongoose.model('MedicalTreatment', treatmentSchema);
