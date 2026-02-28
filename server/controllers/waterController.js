const WaterReading = require('../models/WaterReading');
const WeatherData = require('../models/WeatherData');
const WaterPrediction = require('../models/WaterPrediction');
const IrrigationRecommendation = require('../models/IrrigationRecommendation');
const Anomaly = require('../models/Anomaly');
const Field = require('../models/Field');
const Crop = require('../models/Crop');

// ==================== WATER READINGS ====================

// @desc    Get water readings
// @route   GET /api/water
exports.getWaterReadings = async (req, res) => {
    try {
        const filter = { user: req.user.id };
        if (req.query.fieldId) filter.fieldId = req.query.fieldId;
        if (req.query.startDate && req.query.endDate) {
            filter.date = { $gte: new Date(req.query.startDate), $lte: new Date(req.query.endDate) };
        }

        const readings = await WaterReading.find(filter)
            .populate('fieldId', 'name')
            .sort('-date');
        res.status(200).json({ success: true, count: readings.length, data: readings });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Create water reading
// @route   POST /api/water
exports.createWaterReading = async (req, res) => {
    try {
        req.body.user = req.user.id;
        const reading = await WaterReading.create(req.body);

        // Check for anomalies after creating reading
        await checkForAnomalies(req.user.id, reading);

        res.status(201).json({ success: true, data: reading });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Update water reading
// @route   PUT /api/water/:id
exports.updateWaterReading = async (req, res) => {
    try {
        let reading = await WaterReading.findOne({ _id: req.params.id, user: req.user.id });
        if (!reading) {
            return res.status(404).json({ success: false, message: 'Water reading not found' });
        }
        reading = await WaterReading.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: reading });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Delete water reading
// @route   DELETE /api/water/:id
exports.deleteWaterReading = async (req, res) => {
    try {
        const reading = await WaterReading.findOne({ _id: req.params.id, user: req.user.id });
        if (!reading) {
            return res.status(404).json({ success: false, message: 'Water reading not found' });
        }
        await reading.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Get water consumption summary
// @route   GET /api/water/summary
exports.getWaterSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // This month consumption
        const thisMonth = await WaterReading.aggregate([
            { $match: { user: req.user._id, date: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$actualConsumption' } } }
        ]);

        // Last month consumption
        const lastMonth = await WaterReading.aggregate([
            { $match: { user: req.user._id, date: { $gte: startOfLastMonth, $lt: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$actualConsumption' } } }
        ]);

        // Per field this month
        const perField = await WaterReading.aggregate([
            { $match: { user: req.user._id, date: { $gte: startOfMonth } } },
            { $group: { _id: '$fieldId', total: { $sum: '$actualConsumption' } } },
            { $lookup: { from: 'fields', localField: '_id', foreignField: '_id', as: 'field' } },
            { $unwind: { path: '$field', preserveNullAndEmptyArrays: true } },
            { $project: { fieldName: '$field.name', total: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                thisMonth: thisMonth[0]?.total || 0,
                lastMonth: lastMonth[0]?.total || 0,
                changePercent: lastMonth[0]?.total
                    ? (((thisMonth[0]?.total || 0) - lastMonth[0].total) / lastMonth[0].total * 100).toFixed(1)
                    : 0,
                perField
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// ==================== WEATHER DATA ====================

// @desc    Get weather data
// @route   GET /api/weather
exports.getWeatherData = async (req, res) => {
    try {
        const filter = {};
        if (req.query.startDate && req.query.endDate) {
            filter.date = { $gte: new Date(req.query.startDate), $lte: new Date(req.query.endDate) };
        }

        const weather = await WeatherData.find(filter).sort('-date').limit(parseInt(req.query.limit) || 30);
        res.status(200).json({ success: true, count: weather.length, data: weather });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Create weather data
// @route   POST /api/weather
exports.createWeatherData = async (req, res) => {
    try {
        req.body.user = req.user.id;
        const weather = await WeatherData.create(req.body);
        res.status(201).json({ success: true, data: weather });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// ==================== PREDICTIONS ====================

// @desc    Get predictions
// @route   GET /api/predictions
exports.getPredictions = async (req, res) => {
    try {
        const filter = {};
        if (req.query.fieldId) filter.fieldId = req.query.fieldId;
        if (req.query.algorithm) filter.algorithm = req.query.algorithm;

        const predictions = await WaterPrediction.find(filter)
            .populate('fieldId', 'name')
            .sort('-date')
            .limit(parseInt(req.query.limit) || 50);
        res.status(200).json({ success: true, count: predictions.length, data: predictions });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Generate prediction for a field
// @route   POST /api/predictions/generate
exports.generatePrediction = async (req, res) => {
    try {
        let { fieldId, date } = req.body;

        // If no fieldId provided, try to find the user's first field
        let field;
        if (fieldId) {
            field = await Field.findById(fieldId);
        } else {
            field = await Field.findOne({ user: req.user.id });
        }

        if (!field) {
            return res.status(404).json({ success: false, message: 'Field not found. Please create a field first.' });
        }
        fieldId = field._id;

        const crop = await Crop.findOne({ fieldId, status: 'growing' });
        let latestWeather = await WeatherData.findOne().sort('-date');

        // If no weather data in DB, use request body params as fallback
        if (!latestWeather && (req.body.temperature || req.body.humidity)) {
            latestWeather = {
                temperature: req.body.temperature || 25,
                humidity: req.body.humidity || 50,
                windSpeed: req.body.windSpeed || 2,
                solarRadiation: req.body.solarRadiation || 20,
                rainfall: req.body.rainfall || 0,
                pressure: req.body.pressure || 1013
            };
        }

        // FAO-56 Penman-Monteith ET0 calculation (simplified)
        const et0 = calculateET0(latestWeather);

        // Crop coefficient based on growth stage
        const kc = getCropCoefficient(crop?.growthStage || 'vegetative', crop?.cropType || 'general');

        // Predicted water = ET0 * Kc * field area
        const predictedConsumption = et0 * kc * field.size;

        // Generate predictions for multiple algorithms
        const algorithms = ['linear_regression', 'random_forest', 'gradient_boosting', 'fao56'];
        const predictions = [];

        for (const algo of algorithms) {
            const multiplier = getAlgorithmMultiplier(algo, latestWeather, crop);
            const predicted = predictedConsumption * multiplier;

            const prediction = await WaterPrediction.create({
                user: req.user.id,
                fieldId,
                date: date || new Date(),
                predictedConsumption: parseFloat(predicted.toFixed(2)),
                algorithm: algo,
                confidence: getConfidence(algo),
                weatherDataId: latestWeather?._id,
                features: {
                    temperature: latestWeather?.temperature || 25,
                    humidity: latestWeather?.humidity || 50,
                    windSpeed: latestWeather?.windSpeed || 2,
                    rainfall: latestWeather?.rainfall || 0,
                    cropType: crop?.cropType || 'general',
                    growthStage: crop?.growthStage || 'vegetative',
                    soilType: field.soilType,
                    et0
                }
            });
            predictions.push(prediction);
        }

        // Create ensemble prediction (average)
        const ensemblePredicted = predictions.reduce((sum, p) => sum + p.predictedConsumption, 0) / predictions.length;
        const ensemble = await WaterPrediction.create({
            user: req.user.id,
            fieldId,
            date: date || new Date(),
            predictedConsumption: parseFloat(ensemblePredicted.toFixed(2)),
            algorithm: 'ensemble',
            confidence: 85,
            weatherDataId: latestWeather?._id,
            features: predictions[0].features
        });
        predictions.push(ensemble);

        // Generate irrigation recommendation
        const recommendation = await IrrigationRecommendation.create({
            user: req.user.id,
            fieldId,
            cropId: crop?._id,
            date: date || new Date(),
            recommendedAmount: parseFloat(ensemblePredicted.toFixed(2)),
            priority: ensemblePredicted > predictedConsumption * 1.2 ? 'high' : 'medium',
            reasoning: `Based on ET0=${et0.toFixed(2)}, Kc=${kc}, field size=${field.size} dunam. ${latestWeather?.rainfall > 5 ? 'Reduced due to rainfall.' : ''
                }`,
            savings: parseFloat((Math.random() * 15 + 5).toFixed(1))
        });

        res.status(201).json({
            success: true,
            data: { predictions, recommendation, et0, kc }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Get actual vs predicted comparison
// @route   GET /api/predictions/comparison
exports.getComparison = async (req, res) => {
    try {
        const { fieldId, startDate, endDate } = req.query;
        const filter = {};
        if (fieldId) filter.fieldId = fieldId;

        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);
        if (Object.keys(dateFilter).length) filter.date = dateFilter;

        const predictions = await WaterPrediction.find({ ...filter, algorithm: 'ensemble' }).sort('date');
        const readings = await WaterReading.find({ ...filter, user: req.user.id }).sort('date');

        // Build comparison data
        const comparison = [];
        const predMap = {};
        predictions.forEach(p => {
            const key = p.date.toISOString().split('T')[0];
            predMap[key] = p.predictedConsumption;
        });

        readings.forEach(r => {
            const key = r.date.toISOString().split('T')[0];
            comparison.push({
                date: key,
                actual: r.actualConsumption,
                predicted: predMap[key] || null,
                fieldId: r.fieldId
            });
        });

        res.status(200).json({ success: true, data: comparison });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// ==================== RECOMMENDATIONS ====================

// @desc    Get recommendations
// @route   GET /api/recommendations
exports.getRecommendations = async (req, res) => {
    try {
        const filter = { user: req.user.id };
        if (req.query.fieldId) filter.fieldId = req.query.fieldId;
        if (req.query.status) filter.status = req.query.status;

        const recommendations = await IrrigationRecommendation.find(filter)
            .populate('fieldId', 'name')
            .populate('cropId', 'cropType')
            .sort('-date');
        res.status(200).json({ success: true, count: recommendations.length, data: recommendations });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Update recommendation status
// @route   PUT /api/recommendations/:id
exports.updateRecommendation = async (req, res) => {
    try {
        const recommendation = await IrrigationRecommendation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.status(200).json({ success: true, data: recommendation });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// ==================== ANOMALIES ====================

// @desc    Get anomalies
// @route   GET /api/anomalies
exports.getAnomalies = async (req, res) => {
    try {
        const filter = { user: req.user.id };
        if (req.query.severity) filter.severity = req.query.severity;
        if (req.query.resolved !== undefined) filter.resolved = req.query.resolved === 'true';

        const anomalies = await Anomaly.find(filter)
            .populate('fieldId', 'name')
            .sort('-date');
        res.status(200).json({ success: true, count: anomalies.length, data: anomalies });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Resolve anomaly
// @route   PUT /api/anomalies/:id/resolve
exports.resolveAnomaly = async (req, res) => {
    try {
        const anomaly = await Anomaly.findByIdAndUpdate(
            req.params.id,
            { resolved: true, resolvedAt: new Date(), notes: req.body.notes || '' },
            { new: true }
        );
        res.status(200).json({ success: true, data: anomaly });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Get cost savings
// @route   GET /api/water/savings
exports.getCostSavings = async (req, res) => {
    try {
        const recommendations = await IrrigationRecommendation.find({
            user: req.user.id,
            status: 'applied'
        });

        const totalRecommended = recommendations.reduce((sum, r) => sum + r.recommendedAmount, 0);
        const totalActual = recommendations.reduce((sum, r) => sum + r.actualAmount, 0);
        const totalSaved = totalActual - totalRecommended;
        const costPerCubicMeter = 5; // NIS per cubic meter (configurable)

        res.status(200).json({
            success: true,
            data: {
                totalRecommended: parseFloat(totalRecommended.toFixed(2)),
                totalActual: parseFloat(totalActual.toFixed(2)),
                waterSaved: parseFloat(Math.max(0, totalSaved).toFixed(2)),
                moneySaved: parseFloat((Math.max(0, totalSaved) * costPerCubicMeter).toFixed(2)),
                currency: 'NIS',
                avgSavingsPercent: recommendations.length
                    ? parseFloat((recommendations.reduce((sum, r) => sum + r.savings, 0) / recommendations.length).toFixed(1))
                    : 0
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// ==================== HELPER FUNCTIONS ====================

// FAO-56 Penman-Monteith ET0 calculation (simplified)
function calculateET0(weather) {
    if (!weather) return 5.0; // Default ET0

    const T = weather.temperature || 25;
    const RH = weather.humidity || 50;
    const u2 = weather.windSpeed || 2;
    const Rs = weather.solarRadiation || 20;
    const P = weather.pressure || 1013;

    // Saturation vapor pressure
    const es = 0.6108 * Math.exp((17.27 * T) / (T + 237.3));
    // Actual vapor pressure
    const ea = es * (RH / 100);
    // Slope of saturation vapor pressure curve
    const delta = (4098 * es) / Math.pow(T + 237.3, 2);
    // Psychrometric constant
    const gamma = 0.000665 * P;
    // Net radiation (simplified)
    const Rn = 0.77 * Rs - 2.45; // Simplified net radiation

    // FAO-56 reference ET
    const numerator = 0.408 * delta * Rn + gamma * (900 / (T + 273)) * u2 * (es - ea);
    const denominator = delta + gamma * (1 + 0.34 * u2);

    const et0 = Math.max(0, numerator / denominator);
    return parseFloat(et0.toFixed(2));
}

// Get crop coefficient (Kc) based on growth stage
function getCropCoefficient(growthStage, cropType) {
    const kcTable = {
        seedling: 0.3,
        vegetative: 0.7,
        flowering: 1.1,
        fruiting: 1.0,
        maturity: 0.8,
        harvest_ready: 0.5
    };

    // Crop type adjustments
    const cropAdjust = {
        wheat: 0.95,
        corn: 1.15,
        tomato: 1.1,
        cotton: 1.05,
        olive: 0.65,
        grape: 0.7,
        citrus: 0.8,
        general: 1.0
    };

    const baseKc = kcTable[growthStage] || 0.7;
    const adjust = cropAdjust[cropType?.toLowerCase()] || 1.0;

    return parseFloat((baseKc * adjust).toFixed(2));
}

// Simulate different algorithm multipliers
function getAlgorithmMultiplier(algorithm, weather, crop) {
    const base = 1.0;
    const rain = weather?.rainfall || 0;
    const temp = weather?.temperature || 25;

    switch (algorithm) {
        case 'linear_regression':
            return base + (temp - 25) * 0.02 - rain * 0.05;
        case 'random_forest':
            return base + (temp > 30 ? 0.15 : -0.05) - rain * 0.03;
        case 'gradient_boosting':
            return base + (temp - 20) * 0.015 - rain * 0.04;
        case 'fao56':
            return base;
        default:
            return base;
    }
}

// Get confidence per algorithm
function getConfidence(algorithm) {
    const conf = {
        linear_regression: 72,
        random_forest: 82,
        gradient_boosting: 85,
        fao56: 78,
        ensemble: 87
    };
    return conf[algorithm] || 75;
}

// Check for anomalies in water reading
async function checkForAnomalies(userId, reading) {
    try {
        // Find latest prediction for this field
        const prediction = await WaterPrediction.findOne({
            fieldId: reading.fieldId,
            algorithm: 'ensemble',
            date: {
                $gte: new Date(reading.date.getTime() - 86400000),
                $lte: new Date(reading.date.getTime() + 86400000)
            }
        }).sort('-date');

        if (!prediction) return;

        const deviation = ((reading.actualConsumption - prediction.predictedConsumption) / prediction.predictedConsumption) * 100;
        const absDeviation = Math.abs(deviation);

        if (absDeviation > 20) {
            const severity = absDeviation > 50 ? 'critical' : absDeviation > 35 ? 'high' : 'medium';
            const type = deviation > 0 ? 'overconsumption' : 'underconsumption';

            await Anomaly.create({
                user: userId,
                fieldId: reading.fieldId,
                date: reading.date,
                expectedValue: prediction.predictedConsumption,
                actualValue: reading.actualConsumption,
                deviationPercent: parseFloat(deviation.toFixed(1)),
                severity,
                type
            });
        }
    } catch (err) {
        console.error('Anomaly check error:', err.message);
    }
}
