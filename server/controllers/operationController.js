const AgriculturalOperation = require('../models/AgriculturalOperation');

// @desc    Get all operations
// @route   GET /api/operations
exports.getOperations = async (req, res) => {
    try {
        const filter = { user: req.user.id };
        if (req.query.fieldId) filter.fieldId = req.query.fieldId;
        if (req.query.cropId) filter.cropId = req.query.cropId;
        if (req.query.operationType) filter.operationType = req.query.operationType;

        const operations = await AgriculturalOperation.find(filter)
            .populate('fieldId', 'name')
            .populate('cropId', 'cropType')
            .sort('-date');
        res.status(200).json({ success: true, count: operations.length, data: operations });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Get single operation
// @route   GET /api/operations/:id
exports.getOperation = async (req, res) => {
    try {
        const operation = await AgriculturalOperation.findOne({ _id: req.params.id, user: req.user.id })
            .populate('fieldId', 'name')
            .populate('cropId', 'cropType');
        if (!operation) {
            return res.status(404).json({ success: false, message: 'Operation not found' });
        }
        res.status(200).json({ success: true, data: operation });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Create operation
// @route   POST /api/operations
exports.createOperation = async (req, res) => {
    try {
        req.body.user = req.user.id;
        const operation = await AgriculturalOperation.create(req.body);
        res.status(201).json({ success: true, data: operation });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Update operation
// @route   PUT /api/operations/:id
exports.updateOperation = async (req, res) => {
    try {
        let operation = await AgriculturalOperation.findOne({ _id: req.params.id, user: req.user.id });
        if (!operation) {
            return res.status(404).json({ success: false, message: 'Operation not found' });
        }
        operation = await AgriculturalOperation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: operation });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Delete operation
// @route   DELETE /api/operations/:id
exports.deleteOperation = async (req, res) => {
    try {
        const operation = await AgriculturalOperation.findOne({ _id: req.params.id, user: req.user.id });
        if (!operation) {
            return res.status(404).json({ success: false, message: 'Operation not found' });
        }
        await operation.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};
