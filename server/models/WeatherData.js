const mongoose = require('mongoose');

const weatherDataSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    temperature: {
        type: Number, // Celsius
        required: true
    },
    temperatureMin: {
        type: Number
    },
    temperatureMax: {
        type: Number
    },
    humidity: {
        type: Number, // percentage
        required: true
    },
    windSpeed: {
        type: Number, // m/s
        default: 0
    },
    rainfall: {
        type: Number, // mm
        default: 0
    },
    solarRadiation: {
        type: Number, // MJ/m²/day
        default: 0
    },
    cloudCover: {
        type: Number, // percentage
        default: 0
    },
    pressure: {
        type: Number, // hPa
        default: 1013
    },
    source: {
        type: String,
        enum: ['api', 'manual', 'station'],
        default: 'manual'
    },
    location: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('WeatherData', weatherDataSchema);
