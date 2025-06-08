module.exports = {
    async up(mongoose) {
        // Define the Teacher schema
        const TeacherSchema = new mongoose.Schema({
            firstName: { type: String },
            lastName: { type: String },
            fullname: { type: String },
            gradeid: { type: mongoose.Schema.Types.ObjectId, ref: "Grade" },
            departmentid: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
            modules: [
                {
                    moduleid: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
                    levelid: { type: mongoose.Schema.Types.ObjectId, ref: "Level" },
                    semesterid: { type: mongoose.Schema.Types.ObjectId, ref: "Semester" },
                    hours: {
                        lect: { type: Number, default: 0 },
                        tut: { type: Number, default: 0 },
                        wkshp: { type: Number, default: 0 },
                    },
                },
            ],
        });

        // Register the model
        const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema);
        
        try {
            // Get all teachers
            const teachers = await Teacher.find({});
            
            // Update each teacher
            for (const teacher of teachers) {
                if (teacher.fullname && !teacher.firstName) {
                    // Split the full name into first and last name
                    const nameParts = teacher.fullname.trim().split(/\s+/);
                    const firstName = nameParts[0];
                    const lastName = nameParts.slice(1).join(' ') || ''; // Join remaining parts as last name
                    
                    // Update the teacher
                    await Teacher.updateOne(
                        { _id: teacher._id },
                        { 
                            $set: { 
                                firstName: firstName,
                                lastName: lastName 
                            },
                            $unset: { fullname: "" }
                        }
                    );
                }
            }
            
            console.log('✅ Successfully split teacher names');
        } catch (error) {
            console.error('❌ Error splitting teacher names:', error);
            throw error;
        }
    },

    async down(mongoose) {
        // Define the Teacher schema again for down migration
        const TeacherSchema = new mongoose.Schema({
            firstName: { type: String },
            lastName: { type: String },
            fullname: { type: String },
            gradeid: { type: mongoose.Schema.Types.ObjectId, ref: "Grade" },
            departmentid: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
            modules: [
                {
                    moduleid: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
                    levelid: { type: mongoose.Schema.Types.ObjectId, ref: "Level" },
                    semesterid: { type: mongoose.Schema.Types.ObjectId, ref: "Semester" },
                    hours: {
                        lect: { type: Number, default: 0 },
                        tut: { type: Number, default: 0 },
                        wkshp: { type: Number, default: 0 },
                    },
                },
            ],
        });

        // Register the model
        const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema);
        
        try {
            // Get all teachers
            const teachers = await Teacher.find({});
            
            // Revert each teacher back to using fullname
            for (const teacher of teachers) {
                if (teacher.firstName) {
                    // Combine first and last name back into full name
                    const fullname = `${teacher.firstName} ${teacher.lastName || ''}`.trim();
                    
                    // Update the teacher
                    await Teacher.updateOne(
                        { _id: teacher._id },
                        {
                            $set: { fullname: fullname },
                            $unset: { 
                                firstName: "",
                                lastName: "" 
                            }
                        }
                    );
                }
            }
            
            console.log('✅ Successfully reverted teacher names');
        } catch (error) {
            console.error('❌ Error reverting teacher names:', error);
            throw error;
        }
    }
}; 