const TeacherModuleAffectation = require('../models/TeacherModuleAffectation');
const Teacher = require('../models/Teacher');
const Module = require('../models/Module');

// Create new affectation
exports.createAffectation = async (req, res) => {
    try {
        const affectation = await TeacherModuleAffectation.create(req.body);
        await affectation.populate(['teacher', 'module']);
        res.status(201).json(affectation);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ 
                message: 'An affectation already exists for this teacher and module in the specified academic year and semester' 
            });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
};

// Get all affectations grouped by teacher
exports.getAffectations = async (req, res) => {
    try {
        const affectations = await TeacherModuleAffectation.aggregate([
            {
                $lookup: {
                    from: 'teachers',
                    localField: 'teacher',
                    foreignField: '_id',
                    as: 'teacherInfo'
                }
            },
            {
                $unwind: '$teacherInfo'
            },
            {
                $lookup: {
                    from: 'modules',
                    localField: 'module',
                    foreignField: '_id',
                    as: 'moduleInfo'
                }
            },
            {
                $unwind: '$moduleInfo'
            },
            {
                $group: {
                    _id: '$teacher',
                    teacherName: { 
                        $first: {
                            $concat: [
                                { $ifNull: ['$teacherInfo.firstName', ''] },
                                ' ',
                                { $ifNull: ['$teacherInfo.lastName', ''] }
                            ]
                        }
                    },
                    affectations: {
                        $push: {
                            _id: '$_id',
                            module: '$moduleInfo',
                            academicYear: '$academicYear',
                            semester: '$semester',
                            lectures: '$lectures',
                            tutorials: '$tutorials',
                            workshops: '$workshops'
                        }
                    },
                    totalLectures: { $sum: '$lectures' },
                    totalTutorials: { $sum: '$tutorials' },
                    totalWorkshops: { $sum: '$workshops' }
                }
            },
            {
                $sort: { 'teacherName': 1 }
            }
        ]);

        res.json(affectations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single affectation
exports.getAffectation = async (req, res) => {
    try {
        const affectation = await TeacherModuleAffectation.findById(req.params.id)
            .populate(['teacher', 'module']);
        if (!affectation) {
            return res.status(404).json({ message: 'Affectation not found' });
        }
        res.json(affectation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update affectation
exports.updateAffectation = async (req, res) => {
    try {
        const affectation = await TeacherModuleAffectation.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        ).populate(['teacher', 'module']);

        if (!affectation) {
            return res.status(404).json({ message: 'Affectation not found' });
        }

        res.json(affectation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete affectation
exports.deleteAffectation = async (req, res) => {
    try {
        const affectation = await TeacherModuleAffectation.findByIdAndDelete(req.params.id);
        if (!affectation) {
            return res.status(404).json({ message: 'Affectation not found' });
        }
        res.json({ message: 'Affectation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get teacher's affectations
exports.getTeacherAffectations = async (req, res) => {
    try {
        const affectations = await TeacherModuleAffectation.find({ teacher: req.params.teacherId })
            .populate(['teacher', 'module'])
            .sort({ academicYear: -1, semester: 1 });
        res.json(affectations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 