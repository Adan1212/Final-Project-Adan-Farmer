const Vaccination = require('../models/Vaccination');

// @desc    Get all vaccinations
// @route   GET /api/vaccinations
exports.getVaccinations = async (req, res) => {
    try {
        const filter = { user: req.user.id };
        if (req.query.sheepId) filter.sheepId = req.query.sheepId;

        const vaccinations = await Vaccination.find(filter)
            .populate('sheepId', 'tagNumber name')
            .sort('-date');
        res.status(200).json({ success: true, count: vaccinations.length, data: vaccinations });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Get upcoming vaccinations
// @route   GET /api/vaccinations/upcoming
exports.getUpcomingVaccinations = async (req, res) => {
    try {
        const now = new Date();
        const upcoming = new Date();
        upcoming.setDate(upcoming.getDate() + 30); // Next 30 days

        const vaccinations = await Vaccination.find({
            user: req.user.id,
            nextDueDate: { $gte: now, $lte: upcoming }
        }).populate('sheepId', 'tagNumber name').sort('nextDueDate');

        res.status(200).json({ success: true, count: vaccinations.length, data: vaccinations });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Create vaccination
// @route   POST /api/vaccinations
exports.createVaccination = async (req, res) => {
    try {
        req.body.user = req.user.id;
        const vaccination = await Vaccination.create(req.body);
        res.status(201).json({ success: true, data: vaccination });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Update vaccination
// @route   PUT /api/vaccinations/:id
exports.updateVaccination = async (req, res) => {
    try {
        let vaccination = await Vaccination.findOne({ _id: req.params.id, user: req.user.id });
        if (!vaccination) {
            return res.status(404).json({ success: false, message: 'Vaccination not found' });
        }
        vaccination = await Vaccination.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: vaccination });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Delete vaccination
// @route   DELETE /api/vaccinations/:id
exports.deleteVaccination = async (req, res) => {
    try {
        const vaccination = await Vaccination.findOne({ _id: req.params.id, user: req.user.id });
        if (!vaccination) {
            return res.status(404).json({ success: false, message: 'Vaccination not found' });
        }
        await vaccination.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};
