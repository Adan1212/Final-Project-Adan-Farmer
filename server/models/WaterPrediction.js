const mongoose = require('mongoose');

const waterPredictionSchema = new mongoose.Schema({
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
        required: true
    },
    predictedConsumption: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        default: 'cubic_meters'
    },
    algorithm: {
        type: String,
        enum: ['linear_regression', 'random_forest', 'gradient_boosting', 'fao56', 'ensemble'],
        default: 'ensemble'
    },
    confidence: {
        type: Number, // 0-100
        default: 0
    },
    weatherDataId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WeatherData'
    },
    features: {
        temperature: Number,
        humidity: Number,
        windSpeed: Number,
        rainfall: Number,
        cropType: String,
        growthStage: String,
        soilType: String,
        et0: Number  // Reference evapotranspiration
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('WaterPrediction', waterPredictionSchema);
