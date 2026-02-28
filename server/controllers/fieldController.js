const Field = require('../models/Field');

// @desc    Get all fields
// @route   GET /api/fields
exports.getFields = async (req, res) => {
    try {
        const fields = await Field.find({ user: req.user.id }).sort('-createdAt');
        res.status(200).json({ success: true, count: fields.length, data: fields });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Get single field
// @route   GET /api/fields/:id
exports.getField = async (req, res) => {
    try {
        const field = await Field.findOne({ _id: req.params.id, user: req.user.id });
        if (!field) {
            return res.status(404).json({ success: false, message: 'Field not found' });
        }
        res.status(200).json({ success: true, data: field });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Create field
// @route   POST /api/fields
exports.createField = async (req, res) => {
    try {
        req.body.user = req.user.id;
        const field = await Field.create(req.body);
        res.status(201).json({ success: true, data: field });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Update field
// @route   PUT /api/fields/:id
exports.updateField = async (req, res) => {
    try {
        let field = await Field.findOne({ _id: req.params.id, user: req.user.id });
        if (!field) {
            return res.status(404).json({ success: false, message: 'Field not found' });
        }
        field = await Field.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: field });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// @desc    Delete field
// @route   DELETE /api/fields/:id
exports.deleteField = async (req, res) => {
    try {
        const field = await Field.findOne({ _id: req.params.id, user: req.user.id });
        if (!field) {
            return res.status(404).json({ success: false, message: 'Field not found' });
        }
        await field.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};
