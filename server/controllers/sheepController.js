const Sheep = require('../models/Sheep');

// @desc    Get all sheep
// @route   GET /api/sheep
exports.getSheep = async (req, res) => {
    try {
        const filter = { user: req.user.id };
        if (req.query.status) filter.status = req.query.status;
        if (req.query.gender) filter.gender = req.query.gender;
        if (req.query.healthStatus) filter.healthStatus = req.query.healthStatus;

        const sheep = await Sheep.find(filter)
            .populate('motherId', 'tagNumber name')
            .populate('fatherId', 'tagNumber name')
            .sort('-createdAt');
        res.status(200).json({ success: true, count: sheep.length, data: sheep });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Get single sheep
// @route   GET /api/sheep/:id
exports.getSheepById = async (req, res) => {
    try {
        const sheep = await Sheep.findOne({ _id: req.params.id, user: req.user.id })
            .populate('motherId', 'tagNumber name')
            .populate('fatherId', 'tagNumber name');
        if (!sheep) {
            return res.status(404).json({ success: false, message: 'Sheep not found' });
        }
        res.status(200).json({ success: true, data: sheep });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Create sheep
// @route   POST /api/sheep
exports.createSheep = async (req, res) => {
    try {
        req.body.user = req.user.id;
        if (req.body.weight) {
            req.body.weightHistory = [{ weight: req.body.weight, date: new Date() }];
        }
        const sheep = await Sheep.create(req.body);
        res.status(201).json({ success: true, data: sheep });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Update sheep
// @route   PUT /api/sheep/:id
exports.updateSheep = async (req, res) => {
    try {
        let sheep = await Sheep.findOne({ _id: req.params.id, user: req.user.id });
        if (!sheep) {
            return res.status(404).json({ success: false, message: 'Sheep not found' });
        }

        // If weight changed, add to history
        if (req.body.weight && req.body.weight !== sheep.weight) {
            req.body.$push = { weightHistory: { weight: req.body.weight, date: new Date() } };
        }

        sheep = await Sheep.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: sheep });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Delete sheep
// @route   DELETE /api/sheep/:id
exports.deleteSheep = async (req, res) => {
    try {
        const sheep = await Sheep.findOne({ _id: req.params.id, user: req.user.id });
        if (!sheep) {
            return res.status(404).json({ success: false, message: 'Sheep not found' });
        }
        await sheep.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Get sheep weight history
// @route   GET /api/sheep/:id/weight-history
exports.getWeightHistory = async (req, res) => {
    try {
        const sheep = await Sheep.findOne({ _id: req.params.id, user: req.user.id });
        if (!sheep) {
            return res.status(404).json({ success: false, message: 'Sheep not found' });
        }
        res.status(200).json({ success: true, data: sheep.weightHistory });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};
