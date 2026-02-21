const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // ── Personal Info ──────────────────────────────────────────────────────────
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[+]?[\d\s\-().]{7,20}$/, 'Please provide a valid phone number'],
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say', ''],
  },

  // ── Origin & Residence ─────────────────────────────────────────────────────
  stateOfOrigin: {
    type: String,
    required: [true, 'State of origin is required'],
    trim: true,
    maxlength: [100, 'State of origin cannot exceed 100 characters'],
  },
  lgaOfOrigin: {
    type: String,
    trim: true,
    maxlength: [100, 'LGA of origin cannot exceed 100 characters'],
  },
  stateOfResidence: {
    type: String,
    required: [true, 'State of residence is required'],
    trim: true,
    maxlength: [100, 'State of residence cannot exceed 100 characters'],
  },
  lgaOfResidence: {
    type: String,
    trim: true,
    maxlength: [100, 'LGA of residence cannot exceed 100 characters'],
  },

  // ── Residential Address ────────────────────────────────────────────────────
  address: {
    street: { type: String, trim: true, maxlength: 200 },
    city:   { type: String, trim: true, maxlength: 100 },
    zip:    { type: String, trim: true, maxlength: 20  },
    country:{ type: String, trim: true, maxlength: 100, default: 'Nigeria' },
  },

  // ── Additional Info ────────────────────────────────────────────────────────
  occupation: {
    type: String,
    trim: true,
    maxlength: [100, 'Occupation cannot exceed 100 characters'],
  },
  message: {
    type: String,
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
  },

  // ── Admin Fields ───────────────────────────────────────────────────────────
  status: {
    type: String,
    enum: ['new', 'reviewed', 'contacted', 'archived'],
    default: 'new',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ submittedAt: -1 });
userSchema.index({ status: 1 });
userSchema.index({ stateOfOrigin: 1 });
userSchema.index({ stateOfResidence: 1 });

module.exports = mongoose.model('User', userSchema);
