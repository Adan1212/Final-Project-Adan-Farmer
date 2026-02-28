const Birth = require('../models/Birth');

// @desc    Get all births
// @route   GET /api/births
exports.getBirths = async (req, res) => {
    try {
        const filter = { user: req.user.id };
        if (req.query.motherId) filter.motherId = req.query.motherId;

        const births = await Birth.find(filter)
            .populate('motherId', 'tagNumber name')
            .populate('fatherId', 'tagNumber name')
            .populate('lambIds', 'tagNumber name')
            .sort('-date');
        res.status(200).json({ success: true, count: births.length, data: births });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Create birth
// @route   POST /api/births
exports.createBirth = async (req, res) => {
    try {
        req.body.user = req.user.id;
        const birth = await Birth.create(req.body);
        res.status(201).json({ success: true, data: birth });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Update birth
// @route   PUT /api/births/:id
exports.updateBirth = async (req, res) => {
    try {
        let birth = await Birth.findOne({ _id: req.params.id, user: req.user.id });
        if (!birth) {
            return res.status(404).json({ success: false, message: 'Birth record not found' });
        }
        birth = await Birth.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: birth });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Delete birth
// @route   DELETE /api/births/:id
exports.deleteBirth = async (req, res) => {
    try {
        const birth = await Birth.findOne({ _id: req.params.id, user: req.user.id });
        if (!birth) {
            return res.status(404).json({ success: false, message: 'Birth record not found' });
        }
        await birth.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};
