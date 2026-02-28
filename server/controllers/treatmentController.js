const MedicalTreatment = require('../models/MedicalTreatment');

// @desc    Get all treatments
// @route   GET /api/treatments
exports.getTreatments = async (req, res) => {
    try {
        const filter = { user: req.user.id };
        if (req.query.sheepId) filter.sheepId = req.query.sheepId;
        if (req.query.status) filter.status = req.query.status;

        const treatments = await MedicalTreatment.find(filter)
            .populate('sheepId', 'tagNumber name')
            .sort('-date');
        res.status(200).json({ success: true, count: treatments.length, data: treatments });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Create treatment
// @route   POST /api/treatments
exports.createTreatment = async (req, res) => {
    try {
        req.body.user = req.user.id;
        const treatment = await MedicalTreatment.create(req.body);
        res.status(201).json({ success: true, data: treatment });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Update treatment
// @route   PUT /api/treatments/:id
exports.updateTreatment = async (req, res) => {
    try {
        let treatment = await MedicalTreatment.findOne({ _id: req.params.id, user: req.user.id });
        if (!treatment) {
            return res.status(404).json({ success: false, message: 'Treatment not found' });
        }
        treatment = await MedicalTreatment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: treatment });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Delete treatment
// @route   DELETE /api/treatments/:id
exports.deleteTreatment = async (req, res) => {
    try {
        const treatment = await MedicalTreatment.findOne({ _id: req.params.id, user: req.user.id });
        if (!treatment) {
            return res.status(404).json({ success: false, message: 'Treatment not found' });
        }
        await treatment.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};
