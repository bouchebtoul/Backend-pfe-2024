const mongoose = require("mongoose");

const TeacherSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
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

module.exports = mongoose.model("Teacher", TeacherSchema);
