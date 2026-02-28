const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Field = require('../models/Field');
const Crop = require('../models/Crop');
const Sheep = require('../models/Sheep');
const WaterReading = require('../models/WaterReading');
const WeatherData = require('../models/WeatherData');
const WaterPrediction = require('../models/WaterPrediction');
const IrrigationRecommendation = require('../models/IrrigationRecommendation');
const Anomaly = require('../models/Anomaly');
const Vaccination = require('../models/Vaccination');
const AgriculturalOperation = require('../models/AgriculturalOperation');

const connectDB = require('./db');

const seedDB = async () => {
    try {
        await connectDB();
        console.log('Clearing existing data...');

        await Promise.all([
            User.deleteMany({}),
            Field.deleteMany({}),
            Crop.deleteMany({}),
            Sheep.deleteMany({}),
            WaterReading.deleteMany({}),
            WeatherData.deleteMany({}),
            WaterPrediction.deleteMany({}),
            IrrigationRecommendation.deleteMany({}),
            Anomaly.deleteMany({}),
            Vaccination.deleteMany({}),
            AgriculturalOperation.deleteMany({})
        ]);

        // Create demo user
        const user = await User.create({
            name: 'Adan Farmer',
            email: 'adan@farm.com',
            password: '123456',
            role: 'admin',
            farmName: 'חוות אדן'
        });

        console.log('Created demo user: adan@farm.com / 123456');

        // Create fields
        const fields = await Field.create([
            { user: user._id, name: 'שדה צפוני', size: 50, sizeUnit: 'dunam', soilType: 'loamy', status: 'active', irrigationType: 'drip', location: { address: 'North Field' } },
            { user: user._id, name: 'שדה דרומי', size: 30, sizeUnit: 'dunam', soilType: 'sandy', status: 'active', irrigationType: 'sprinkler', location: { address: 'South Field' } },
            { user: user._id, name: 'מטע זיתים', size: 20, sizeUnit: 'dunam', soilType: 'clay', status: 'active', irrigationType: 'drip', location: { address: 'Olive Grove' } },
            { user: user._id, name: 'חממה', size: 5, sizeUnit: 'dunam', soilType: 'loamy', status: 'active', irrigationType: 'drip', location: { address: 'Greenhouse' } }
        ]);
        console.log(`Created ${fields.length} fields`);

        // Create crops
        const crops = await Crop.create([
            { user: user._id, fieldId: fields[0]._id, cropType: 'חיטה', growthStage: 'vegetative', plantingDate: new Date('2025-11-01'), expectedHarvestDate: new Date('2026-05-15'), waterRequirement: 4, status: 'growing' },
            { user: user._id, fieldId: fields[1]._id, cropType: 'עגבניות', growthStage: 'flowering', plantingDate: new Date('2026-01-15'), expectedHarvestDate: new Date('2026-06-01'), waterRequirement: 8, status: 'growing' },
            { user: user._id, fieldId: fields[2]._id, cropType: 'זיתים', growthStage: 'fruiting', plantingDate: new Date('2020-03-01'), expectedHarvestDate: new Date('2026-10-15'), waterRequirement: 3, status: 'growing' },
            { user: user._id, fieldId: fields[3]._id, cropType: 'מלפפונים', growthStage: 'seedling', plantingDate: new Date('2026-02-20'), expectedHarvestDate: new Date('2026-05-01'), waterRequirement: 6, status: 'growing' }
        ]);
        console.log(`Created ${crops.length} crops`);

        // Create sheep
        const sheepData = [];
        const breeds = ['אוואסי', 'מרינו', 'אסף', 'לקון'];
        for (let i = 1; i <= 20; i++) {
            sheepData.push({
                user: user._id,
                tagNumber: `SH-${String(i).padStart(3, '0')}`,
                name: `כבש ${i}`,
                breed: breeds[i % breeds.length],
                gender: i % 3 === 0 ? 'male' : 'female',
                birthDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                weight: 40 + Math.floor(Math.random() * 40),
                status: 'active',
                healthStatus: i % 7 === 0 ? 'pregnant' : i % 10 === 0 ? 'sick' : 'healthy',
                weightHistory: [
                    { weight: 20 + Math.floor(Math.random() * 10), date: new Date(2023, 6, 1) },
                    { weight: 30 + Math.floor(Math.random() * 15), date: new Date(2024, 0, 1) },
                    { weight: 40 + Math.floor(Math.random() * 30), date: new Date(2024, 6, 1) },
                    { weight: 40 + Math.floor(Math.random() * 40), date: new Date(2025, 0, 1) }
                ]
            });
        }
        const sheep = await Sheep.create(sheepData);
        console.log(`Created ${sheep.length} sheep`);

        // Create vaccinations
        const vaccinations = [];
        for (let i = 0; i < 10; i++) {
            vaccinations.push({
                user: user._id,
                sheepId: sheep[i % sheep.length]._id,
                vaccineName: ['קלוסטרידיום', 'ברוצלוזיס', 'פסטרלוזיס', 'אנתרקס'][i % 4],
                date: new Date(2025, 10 + (i % 3), Math.floor(Math.random() * 28) + 1),
                nextDueDate: new Date(2026, 2 + (i % 4), Math.floor(Math.random() * 28) + 1),
                veterinarian: 'ד"ר כהן'
            });
        }
        await Vaccination.create(vaccinations);
        console.log(`Created ${vaccinations.length} vaccinations`);

        // Create weather data (last 30 days)
        const weatherData = [];
        for (let i = 30; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            weatherData.push({
                user: user._id,
                date: d,
                temperature: 15 + Math.random() * 15,
                temperatureMin: 10 + Math.random() * 8,
                temperatureMax: 20 + Math.random() * 15,
                humidity: 40 + Math.random() * 40,
                windSpeed: 1 + Math.random() * 6,
                rainfall: Math.random() > 0.7 ? Math.random() * 20 : 0,
                solarRadiation: 15 + Math.random() * 10,
                source: 'manual'
            });
        }
        await WeatherData.create(weatherData);
        console.log(`Created ${weatherData.length} weather records`);

        // Create water readings (last 30 days per field)
        const waterReadings = [];
        for (const field of fields) {
            for (let i = 30; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                waterReadings.push({
                    user: user._id,
                    fieldId: field._id,
                    date: d,
                    actualConsumption: (field.size * (3 + Math.random() * 4)).toFixed(1),
                    unit: 'cubic_meters',
                    source: 'manual',
                    readingType: 'daily'
                });
            }
        }
        await WaterReading.create(waterReadings);
        console.log(`Created ${waterReadings.length} water readings`);

        // Create agricultural operations
        const operations = await AgriculturalOperation.create([
            { user: user._id, fieldId: fields[0]._id, cropId: crops[0]._id, operationType: 'planting', date: new Date('2025-11-01'), notes: 'שתילת חיטה', performedBy: 'אדן', status: 'completed' },
            { user: user._id, fieldId: fields[0]._id, cropId: crops[0]._id, operationType: 'fertilizing', date: new Date('2026-01-15'), notes: 'דישון חורף', performedBy: 'אדן', cost: 500, status: 'completed' },
            { user: user._id, fieldId: fields[1]._id, cropId: crops[1]._id, operationType: 'planting', date: new Date('2026-01-15'), notes: 'שתילת עגבניות', performedBy: 'אדן', status: 'completed' },
            { user: user._id, fieldId: fields[1]._id, cropId: crops[1]._id, operationType: 'spraying', date: new Date('2026-02-10'), notes: 'ריסוס מונע', performedBy: 'אדן', cost: 300, status: 'completed' },
            { user: user._id, fieldId: fields[2]._id, cropId: crops[2]._id, operationType: 'irrigation', date: new Date('2026-02-20'), notes: 'השקיה שבועית', performedBy: 'אדן', status: 'completed' }
        ]);
        console.log(`Created ${operations.length} operations`);

        // Create anomalies
        const anomalyData = [
            { user: user._id, fieldId: fields[0]._id, date: new Date('2026-02-26'), expectedValue: 180, actualValue: 295, deviationPercent: 63.9, severity: 'critical', type: 'overconsumption', resolved: false, notes: '' },
            { user: user._id, fieldId: fields[1]._id, date: new Date('2026-02-25'), expectedValue: 120, actualValue: 175, deviationPercent: 45.8, severity: 'high', type: 'overconsumption', resolved: false, notes: '' },
            { user: user._id, fieldId: fields[2]._id, date: new Date('2026-02-24'), expectedValue: 60, actualValue: 22, deviationPercent: -63.3, severity: 'high', type: 'underconsumption', resolved: false, notes: '' },
            { user: user._id, fieldId: fields[0]._id, date: new Date('2026-02-22'), expectedValue: 185, actualValue: 240, deviationPercent: 29.7, severity: 'medium', type: 'overconsumption', resolved: true, resolvedAt: new Date('2026-02-23'), notes: 'תוקן - צינור דולף' },
            { user: user._id, fieldId: fields[3]._id, date: new Date('2026-02-20'), expectedValue: 30, actualValue: 78, deviationPercent: 160, severity: 'critical', type: 'leak_suspected', resolved: false, notes: '' },
            { user: user._id, fieldId: fields[1]._id, date: new Date('2026-02-18'), expectedValue: 115, actualValue: 150, deviationPercent: 30.4, severity: 'medium', type: 'overconsumption', resolved: true, resolvedAt: new Date('2026-02-19'), notes: 'גל חום - צריכה מוצדקת' },
            { user: user._id, fieldId: fields[2]._id, date: new Date('2026-02-15'), expectedValue: 55, actualValue: 12, deviationPercent: -78.2, severity: 'critical', type: 'sensor_error', resolved: true, resolvedAt: new Date('2026-02-16'), notes: 'חיישן הוחלף' },
            { user: user._id, fieldId: fields[0]._id, date: new Date('2026-02-12'), expectedValue: 190, actualValue: 260, deviationPercent: 36.8, severity: 'high', type: 'overconsumption', resolved: false, notes: '' }
        ];
        await Anomaly.create(anomalyData);
        console.log(`Created ${anomalyData.length} anomalies`);

        // Create water predictions with potentialSaving
        const algorithms = ['linear_regression', 'random_forest', 'gradient_boosting', 'fao56', 'ensemble'];
        const confidences = { linear_regression: 72, random_forest: 82, gradient_boosting: 85, fao56: 78, ensemble: 87 };
        const predData = [];
        for (const field of fields) {
            for (const algo of algorithms) {
                const base = field.size * 3.5;
                const mult = algo === 'linear_regression' ? 0.85 : algo === 'random_forest' ? 1.05 : algo === 'gradient_boosting' ? 1.0 : algo === 'fao56' ? 1.1 : 1.0;
                const predicted = +(base * mult).toFixed(2);
                const saving = +(predicted * (0.1 + Math.random() * 0.15) * 5).toFixed(0);
                predData.push({
                    user: user._id, fieldId: field._id, date: new Date(),
                    predictedConsumption: predicted, algorithm: algo, confidence: confidences[algo],
                    potentialSaving: saving,
                    features: { temperature: 22, humidity: 55, windSpeed: 3, rainfall: 0, cropType: 'חיטה', growthStage: 'vegetative', soilType: field.soilType, et0: 3.29 }
                });
            }
        }
        await WaterPrediction.create(predData);
        console.log(`Created ${predData.length} water predictions`);

        console.log('\n✅ Database seeded successfully!');
        console.log('Login: adan@farm.com / 123456\n');
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
};

seedDB();
