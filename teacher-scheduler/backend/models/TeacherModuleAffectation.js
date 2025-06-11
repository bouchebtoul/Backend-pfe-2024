const mongoose = require('mongoose');

const teacherModuleAffectationSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true,
        enum: [1, 2]
    },
    lectures: {
        type: Number,
        default: 0,
        min: 0
    },
    tutorials: {
        type: Number,
        default: 0,
        min: 0
    },
    workshops: {
        type: Number,
        default: 0,
        min: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure unique combination of teacher, module, and academic year
teacherModuleAffectationSchema.index(
    { teacher: 1, module: 1, academicYear: 1, semester: 1 }, 
    { unique: true }
);

module.exports = mongoose.model('TeacherModuleAffectation', teacherModuleAffectationSchema);