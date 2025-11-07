import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verifyOTP: {
    type: String,
    default: "",
  },
  verifyOTPExpires: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  resetOTP: {
    type: String,
    default: "",
  },
  resetOTPExpires: {
    type: Number,
    default: 0,
  },
});

const User = mongoose.models.user || mongoose.model("User", userSchema);

export default User;
