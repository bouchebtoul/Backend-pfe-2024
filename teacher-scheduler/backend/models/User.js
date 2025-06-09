const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  // fullname: { type: String, required: true },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return email.endsWith('@univ-constantine2.dz');
      },
      message: 'Email must be from the domain @univ-constantine2.dz'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true }, // Reference to Role
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, { timestamps: true });
// Virtual for full name
UserSchema.virtual('fullname').get(function() {
  return `${this.firstName} ${this.lastName}`;
});
// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Don't return password in JSON
UserSchema.set('toJSON', {
  transform: function(doc, ret, opt) {
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model("User", UserSchema);
