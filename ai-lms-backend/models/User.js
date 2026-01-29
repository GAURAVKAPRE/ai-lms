// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],

  instructorProfile: {
    enabled: { type: Boolean, default: false },
    coursesCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    earnings: { type: Number, default: 0 },
  },
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
