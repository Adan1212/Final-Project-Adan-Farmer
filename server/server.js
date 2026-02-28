const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const { isMemoryServer } = require('./config/db');

// Connect to database, then auto-seed if using memory server
connectDB().then(async () => {
    if (isMemoryServer()) {
        console.log('In-memory DB detected, auto-seeding demo data...');
        try {
            const User = require('./models/User');
            const count = await User.countDocuments();
            if (count === 0) {
                await seedDemoData();
                console.log('✅ Demo data seeded automatically');
            }
        } catch (err) {
            console.error('Auto-seed error:', err.message);
        }
    }
});

async function seedDemoData() {
    const User = require('./models/User');
    const Field = require('./models/Field');
    const Crop = require('./models/Crop');
    const Sheep = require('./models/Sheep');
    const WaterReading = require('./models/WaterReading');
    const WeatherData = require('./models/WeatherData');
    const WaterPrediction = require('./models/WaterPrediction');
    const IrrigationRecommendation = require('./models/IrrigationRecommendation');
    const Anomaly = require('./models/Anomaly');
    const Birth = require('./models/Birth');
    const MedicalTreatment = require('./models/MedicalTreatment');
    const Vaccination = require('./models/Vaccination');
    const AgriculturalOperation = require('./models/AgriculturalOperation');

    const user = await User.create({
        name: 'Adan Farmer', email: 'adan@farm.com', password: '123456', role: 'admin', farmName: 'חוות אדן'
    });

    const fields = await Field.create([
        { user: user._id, name: 'שדה צפוני', size: 50, sizeUnit: 'dunam', soilType: 'loamy', status: 'active', irrigationType: 'drip', location: { address: 'North Field' } },
        { user: user._id, name: 'שדה דרומי', size: 30, sizeUnit: 'dunam', soilType: 'sandy', status: 'active', irrigationType: 'sprinkler', location: { address: 'South Field' } },
        { user: user._id, name: 'מטע זיתים', size: 20, sizeUnit: 'dunam', soilType: 'clay', status: 'active', irrigationType: 'drip', location: { address: 'Olive Grove' } },
        { user: user._id, name: 'חממה', size: 5, sizeUnit: 'dunam', soilType: 'loamy', status: 'active', irrigationType: 'drip', location: { address: 'Greenhouse' } }
    ]);

    const crops = await Crop.create([
        { user: user._id, fieldId: fields[0]._id, cropType: 'חיטה', growthStage: 'vegetative', plantingDate: new Date('2025-11-01'), expectedHarvestDate: new Date('2026-05-15'), waterRequirement: 4, status: 'growing' },
        { user: user._id, fieldId: fields[1]._id, cropType: 'עגבניות', growthStage: 'flowering', plantingDate: new Date('2026-01-15'), expectedHarvestDate: new Date('2026-06-01'), waterRequirement: 8, status: 'growing' },
        { user: user._id, fieldId: fields[2]._id, cropType: 'זיתים', growthStage: 'fruiting', plantingDate: new Date('2020-03-01'), expectedHarvestDate: new Date('2026-10-15'), waterRequirement: 3, status: 'growing' },
        { user: user._id, fieldId: fields[3]._id, cropType: 'מלפפונים', growthStage: 'seedling', plantingDate: new Date('2026-02-20'), expectedHarvestDate: new Date('2026-05-01'), waterRequirement: 6, status: 'growing' }
    ]);

    const sheepData = [];
    const breeds = ['אוואסי', 'מרינו', 'אסף', 'לקון'];
    for (let i = 1; i <= 20; i++) {
        sheepData.push({
            user: user._id, tagNumber: `SH-${String(i).padStart(3, '0')}`, name: `כבש ${i}`,
            breed: breeds[i % breeds.length], gender: i % 3 === 0 ? 'male' : 'female',
            birthDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            weight: 40 + Math.floor(Math.random() * 40), status: 'active',
            healthStatus: i % 7 === 0 ? 'pregnant' : i % 10 === 0 ? 'sick' : 'healthy',
            weightHistory: [
                { weight: 20 + Math.floor(Math.random() * 10), date: new Date(2023, 6, 1) },
                { weight: 30 + Math.floor(Math.random() * 15), date: new Date(2024, 0, 1) },
                { weight: 40 + Math.floor(Math.random() * 30), date: new Date(2024, 6, 1) }
            ]
        });
    }
    const sheep = await Sheep.create(sheepData);

    const vaccinations = [];
    for (let i = 0; i < 10; i++) {
        vaccinations.push({
            user: user._id, sheepId: sheep[i % sheep.length]._id,
            vaccineName: ['קלוסטרידיום', 'ברוצלוזיס', 'פסטרלוזיס', 'אנתרקס'][i % 4],
            date: new Date(2025, 10 + (i % 3), Math.floor(Math.random() * 28) + 1),
            nextDueDate: new Date(2026, 2 + (i % 4), Math.floor(Math.random() * 28) + 1),
            veterinarian: 'ד"ר כהן'
        });
    }
    await Vaccination.create(vaccinations);

    const weatherData = [];
    for (let i = 30; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        weatherData.push({
            user: user._id, date: d, temperature: 15 + Math.random() * 15,
            temperatureMin: 10 + Math.random() * 8, temperatureMax: 20 + Math.random() * 15,
            humidity: 40 + Math.random() * 40, windSpeed: 1 + Math.random() * 6,
            rainfall: Math.random() > 0.7 ? Math.random() * 20 : 0,
            solarRadiation: 15 + Math.random() * 10, source: 'manual'
        });
    }
    await WeatherData.create(weatherData);

    const waterReadings = [];
    for (const field of fields) {
        for (let i = 30; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            waterReadings.push({
                user: user._id, fieldId: field._id, date: d,
                actualConsumption: +(field.size * (3 + Math.random() * 4)).toFixed(1),
                unit: 'cubic_meters', source: 'manual', readingType: 'daily'
            });
        }
    }
    await WaterReading.create(waterReadings);

    await AgriculturalOperation.create([
        { user: user._id, fieldId: fields[0]._id, cropId: crops[0]._id, operationType: 'planting', date: new Date('2025-11-01'), notes: 'שתילת חיטה', performedBy: 'אדן', status: 'completed' },
        { user: user._id, fieldId: fields[1]._id, cropId: crops[1]._id, operationType: 'fertilizing', date: new Date('2026-01-15'), notes: 'דישון חורף', performedBy: 'אדן', cost: 500, status: 'completed' },
        { user: user._id, fieldId: fields[1]._id, cropId: crops[1]._id, operationType: 'spraying', date: new Date('2026-02-10'), notes: 'ריסוס מונע', performedBy: 'אדן', cost: 300, status: 'completed' },
        { user: user._id, fieldId: fields[2]._id, cropId: crops[2]._id, operationType: 'irrigation', date: new Date('2026-02-20'), notes: 'השקיה שבועית', performedBy: 'אדן', status: 'completed' }
    ]);

    // --- Anomalies ---
    await Anomaly.create([
        { user: user._id, fieldId: fields[0]._id, date: new Date('2026-02-26'), expectedValue: 180, actualValue: 295, deviationPercent: 63.9, severity: 'critical', type: 'overconsumption', resolved: false },
        { user: user._id, fieldId: fields[1]._id, date: new Date('2026-02-25'), expectedValue: 120, actualValue: 175, deviationPercent: 45.8, severity: 'high', type: 'overconsumption', resolved: false },
        { user: user._id, fieldId: fields[2]._id, date: new Date('2026-02-24'), expectedValue: 60, actualValue: 22, deviationPercent: -63.3, severity: 'high', type: 'underconsumption', resolved: false },
        { user: user._id, fieldId: fields[0]._id, date: new Date('2026-02-22'), expectedValue: 185, actualValue: 240, deviationPercent: 29.7, severity: 'medium', type: 'overconsumption', resolved: true, resolvedAt: new Date('2026-02-23'), notes: 'תוקן - צינור דולף' },
        { user: user._id, fieldId: fields[3]._id, date: new Date('2026-02-20'), expectedValue: 30, actualValue: 78, deviationPercent: 160, severity: 'critical', type: 'leak_suspected', resolved: false },
        { user: user._id, fieldId: fields[1]._id, date: new Date('2026-02-18'), expectedValue: 115, actualValue: 150, deviationPercent: 30.4, severity: 'medium', type: 'overconsumption', resolved: true, resolvedAt: new Date('2026-02-19'), notes: 'גל חום - צריכה מוצדקת' },
        { user: user._id, fieldId: fields[2]._id, date: new Date('2026-02-15'), expectedValue: 55, actualValue: 12, deviationPercent: -78.2, severity: 'critical', type: 'sensor_error', resolved: true, resolvedAt: new Date('2026-02-16'), notes: 'חיישן הוחלף' },
        { user: user._id, fieldId: fields[0]._id, date: new Date('2026-02-12'), expectedValue: 190, actualValue: 260, deviationPercent: 36.8, severity: 'high', type: 'overconsumption', resolved: false }
    ]);

    // --- Water Predictions (per algorithm per field) ---
    const algorithms = ['linear_regression', 'random_forest', 'gradient_boosting', 'fao56', 'ensemble'];
    const confidences = { linear_regression: 72, random_forest: 82, gradient_boosting: 85, fao56: 78, ensemble: 87 };
    const predData = [];
    for (const field of fields) {
        for (const algo of algorithms) {
            const base = field.size * 3.5;
            const mult = algo === 'linear_regression' ? 0.85 : algo === 'random_forest' ? 1.05 : algo === 'gradient_boosting' ? 1.0 : algo === 'fao56' ? 1.1 : 1.0;
            const predicted = +(base * mult).toFixed(2);
            const saving = +(predicted * (0.1 + Math.random() * 0.15) * 5).toFixed(0); // 10-25% savings * ₪5/m³
            predData.push({
                user: user._id, fieldId: field._id, date: new Date(),
                predictedConsumption: predicted, algorithm: algo, confidence: confidences[algo],
                potentialSaving: saving,
                features: { temperature: 22, humidity: 55, windSpeed: 3, rainfall: 0, cropType: 'חיטה', growthStage: 'vegetative', soilType: field.soilType, et0: 3.29 }
            });
        }
    }
    await WaterPrediction.create(predData);

    // --- Births ---
    const mothers = sheep.filter(s => s.gender === 'female').slice(0, 6);
    const fathers = sheep.filter(s => s.gender === 'male').slice(0, 2);
    await Birth.create([
        { user: user._id, motherId: mothers[0]._id, fatherId: fathers[0]?._id, date: new Date('2026-02-10'), numberOfLambs: 2, birthType: 'natural', notes: 'לידה תקינה' },
        { user: user._id, motherId: mothers[1]._id, fatherId: fathers[0]?._id, date: new Date('2026-02-05'), numberOfLambs: 1, birthType: 'natural', notes: '' },
        { user: user._id, motherId: mothers[2]._id, fatherId: fathers[1]?._id, date: new Date('2026-01-28'), numberOfLambs: 3, birthType: 'assisted', complications: 'לידה ממושכת', notes: 'נדרש סיוע וטרינרי' },
        { user: user._id, motherId: mothers[3]._id, fatherId: fathers[1]?._id, date: new Date('2026-01-20'), numberOfLambs: 2, birthType: 'natural', notes: '' },
        { user: user._id, motherId: mothers[4]._id, date: new Date('2026-01-12'), numberOfLambs: 1, birthType: 'cesarean', complications: 'ניתוח קיסרי', notes: 'האם והטלה בריאים' },
        { user: user._id, motherId: mothers[5]._id, fatherId: fathers[0]?._id, date: new Date('2025-12-25'), numberOfLambs: 2, birthType: 'natural', notes: '' }
    ]);

    // --- Medical Treatments ---
    await MedicalTreatment.create([
        { user: user._id, sheepId: sheep[0]._id, diagnosis: 'דלקת רגל', treatment: 'חיטוי ותרופה מקומית', date: new Date('2026-02-25'), cost: 150, veterinarian: 'ד"ר כהן', medications: 'אנטיביוטיקה', status: 'ongoing', followUpDate: new Date('2026-03-05') },
        { user: user._id, sheepId: sheep[3]._id, diagnosis: 'זיהום בעייניים', treatment: 'טיפול בטיפות עיניים', date: new Date('2026-02-20'), cost: 80, veterinarian: 'ד"ר כהן', medications: 'טיפות עיניים', status: 'completed' },
        { user: user._id, sheepId: sheep[6]._id, diagnosis: 'שלשול', treatment: 'מנוחה ונוזלים', date: new Date('2026-02-15'), cost: 200, veterinarian: 'ד"ר לוי', medications: 'נוגד שלשול', status: 'completed' },
        { user: user._id, sheepId: sheep[9]._id, diagnosis: 'פצע בפרסה', treatment: 'חיטוי וחבישה', date: new Date('2026-02-10'), cost: 120, veterinarian: 'ד"ר כהן', medications: 'תרסיס אנטיביוטי', status: 'follow_up_needed', followUpDate: new Date('2026-03-01') },
        { user: user._id, sheepId: sheep[12]._id, diagnosis: 'חום גבוה', treatment: 'הורדת חום ומתן נוזלים', date: new Date('2026-02-02'), cost: 300, veterinarian: 'ד"ר לוי', medications: 'נוזלי IV, משכך כאב', status: 'completed', notes: 'החלמה מלאה' },
        { user: user._id, sheepId: sheep[15]._id, diagnosis: 'בעיה בעור', treatment: 'ניקוי וחיטוי מקומי', date: new Date('2026-01-25'), cost: 90, veterinarian: 'ד"ר כהן', medications: 'משחת חיטוי', status: 'completed' }
    ]);

    console.log('Seeded: 1 user, 4 fields, 4 crops, 20 sheep, 10 vaccinations, 31 weather, 124 water readings, 4 operations, 8 anomalies, 20 predictions, 6 births, 6 treatments');
}

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));

// Logging in development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/fields', require('./routes/fields'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/operations', require('./routes/operations'));
app.use('/api/sheep', require('./routes/sheep'));
app.use('/api/vaccinations', require('./routes/vaccinations'));
app.use('/api/treatments', require('./routes/treatments'));
app.use('/api/births', require('./routes/births'));
app.use('/api/water', require('./routes/water'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/predictions', require('./routes/predictions'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/anomalies', require('./routes/anomalies'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
    });
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚜 Farm Manager API running on port ${PORT}`);
});
