import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    reportId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    reportedUser: {
        type: String,
        required: true,
        trim: true
    },
    reportedBy: {
        type: String,
        required: true,
        trim: true
    },
    severity: {
        type: String,
        required: true,
        enum: ['Mild', 'Normal', 'Critical'],
        default: 'Normal'
    },
    issue: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Under Review', 'Resolved'],
        default: 'Pending'
    },
    reportedAt: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model('Report', reportSchema);