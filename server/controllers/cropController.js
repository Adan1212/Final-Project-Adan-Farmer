const Crop = require('../models/Crop');

// @desc    Get all crops
// @route   GET /api/crops
exports.getCrops = async (req, res) => {
    try {
        const filter = { user: req.user.id };
        if (req.query.fieldId) filter.fieldId = req.query.fieldId;
        if (req.query.status) filter.status = req.query.status;

        const crops = await Crop.find(filter).populate('fieldId', 'name').sort('-createdAt');
        res.status(200).json({ success: true, count: crops.length, data: crops });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Get single crop
// @route   GET /api/crops/:id
exports.getCrop = async (req, res) => {
    try {
        const crop = await Crop.findOne({ _id: req.params.id, user: req.user.id }).populate('fieldId', 'name');
        if (!crop) {
            return res.status(404).json({ success: false, message: 'Crop not found' });
        }
        res.status(200).json({ success: true, data: crop });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Create crop
// @route   POST /api/crops
exports.createCrop = async (req, res) => {
    try {
        req.body.user = req.user.id;
        const crop = await Crop.create(req.body);
        res.status(201).json({ success: true, data: crop });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Update crop
// @route   PUT /api/crops/:id
exports.updateCrop = async (req, res) => {
    try {
        let crop = await Crop.findOne({ _id: req.params.id, user: req.user.id });
        if (!crop) {
            return res.status(404).json({ success: false, message: 'Crop not found' });
        }
        crop = await Crop.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: crop });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Delete crop
// @route   DELETE /api/crops/:id
exports.deleteCrop = async (req, res) => {
    try {
        const crop = await Crop.findOne({ _id: req.params.id, user: req.user.id });
        if (!crop) {
            return res.status(404).json({ success: false, message: 'Crop not found' });
        }
        await crop.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};
