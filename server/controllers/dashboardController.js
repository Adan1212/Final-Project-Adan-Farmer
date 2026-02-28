const Field = require('../models/Field');
const Crop = require('../models/Crop');
const Sheep = require('../models/Sheep');
const WaterReading = require('../models/WaterReading');
const Anomaly = require('../models/Anomaly');
const Vaccination = require('../models/Vaccination');
const AgriculturalOperation = require('../models/AgriculturalOperation');
const IrrigationRecommendation = require('../models/IrrigationRecommendation');
const Birth = require('../models/Birth');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const userObjId = req.user._id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

        // Parallel queries for performance
        const [
            totalFields,
            activeFields,
            totalCrops,
            growingCrops,
            totalSheep,
            activeSheep,
            healthySheep,
            sickSheep,
            pregnantSheep,
            recentOperations,
            monthlyWater,
            unresolvedAnomalies,
            upcomingVaccinations,
            pendingRecommendations,
            recentBirths,
            waterReadings
        ] = await Promise.all([
            Field.countDocuments({ user: userId }),
            Field.countDocuments({ user: userId, status: 'active' }),
            Crop.countDocuments({ user: userId }),
            Crop.countDocuments({ user: userId, status: 'growing' }),
            Sheep.countDocuments({ user: userId }),
            Sheep.countDocuments({ user: userId, status: 'active' }),
            Sheep.countDocuments({ user: userId, healthStatus: 'healthy' }),
            Sheep.countDocuments({ user: userId, healthStatus: 'sick' }),
            Sheep.countDocuments({ user: userId, healthStatus: 'pregnant' }),
            AgriculturalOperation.find({ user: userId }).sort('-date').limit(5)
                .populate('fieldId', 'name').populate('cropId', 'cropType'),
            WaterReading.aggregate([
                { $match: { user: userObjId, date: { $gte: startOfMonth } } },
                { $group: { _id: null, total: { $sum: '$actualConsumption' } } }
            ]),
            Anomaly.countDocuments({ user: userId, resolved: false }),
            Vaccination.find({
                user: userId,
                nextDueDate: { $gte: now, $lte: new Date(now.getTime() + 14 * 86400000) }
            }).populate('sheepId', 'tagNumber name').sort('nextDueDate').limit(5),
            IrrigationRecommendation.find({ user: userId, status: 'pending' })
                .populate('fieldId', 'name').sort('-date').limit(5),
            Birth.find({ user: userId, date: { $gte: thirtyDaysAgo } }).sort('-date').limit(5)
                .populate('motherId', 'tagNumber name'),
            WaterReading.find({ user: userId, date: { $gte: thirtyDaysAgo } })
                .sort('date').select('date actualConsumption fieldId')
        ]);

        // Water trend data (last 30 days)
        const waterTrend = {};
        waterReadings.forEach(r => {
            const day = r.date.toISOString().split('T')[0];
            waterTrend[day] = (waterTrend[day] || 0) + r.actualConsumption;
        });

        res.status(200).json({
            success: true,
            data: {
                fields: { total: totalFields, active: activeFields },
                crops: { total: totalCrops, growing: growingCrops },
                sheep: {
                    total: totalSheep,
                    active: activeSheep,
                    healthy: healthySheep,
                    sick: sickSheep,
                    pregnant: pregnantSheep
                },
                water: {
                    monthlyConsumption: monthlyWater[0]?.total || 0,
                    unresolvedAnomalies,
                    trend: Object.entries(waterTrend).map(([date, value]) => ({ date, value }))
                },
                alerts: {
                    upcomingVaccinations,
                    pendingRecommendations,
                    unresolvedAnomalies
                },
                recentActivity: {
                    operations: recentOperations,
                    births: recentBirths
                }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};
