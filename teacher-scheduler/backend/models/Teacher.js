const mongoose = require("mongoose");

const TeacherSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gradeid: { type: mongoose.Schema.Types.ObjectId, ref: "Grade", required: true },
  departmentid: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  modules: [
    {
      moduleid: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
      levelid: { type: mongoose.Schema.Types.ObjectId, ref: "Level", required: true },
      semesterid: { type: mongoose.Schema.Types.ObjectId, ref: "Semester", required: true },
      hours: {
        lect: { type: Number, default: 0 },
        tut: { type: Number, default: 0 },
        wkshp: { type: Number, default: 0 },
      },
    },
  ],
});

// Virtual for full name
TeacherSchema.virtual('fullname').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included when converting document to JSON
TeacherSchema.set('toJSON', { virtuals: true });
TeacherSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Teacher", TeacherSchema);
