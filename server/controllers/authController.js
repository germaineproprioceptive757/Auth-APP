import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please fill all fields" });
  }
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    // Create a new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });
    // Set the token in a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict", // Use 'None' for cross-site cookies in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    // sending welcome email
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: newUser.email,
      subject: "Welcome to Auth App",
      text: `Hello ${name},\n\nThank you for registering with Auth App.\n\nBest regards,\nAuth App Team`,
    };

    await transporter
      .sendMail(mailOptions)
      .then(() => console.log("Welcome email sent successfully"))
      .catch((error) => console.error("Error sending welcome email:", error));
    return res
      .status(200)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Error in register:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  // Validate input
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please fill all fields" });
  }
  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });
    // Set the token in a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict", // Use 'None' for cross-site cookies in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
    return res
      .status(200)
      .json({ success: true, message: "User logged in successfully" });
  } catch (error) {
    console.error("Error in login:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear the cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict", // Use 'None' for cross-site cookies in production
    });
  } catch (error) {
    console.error("Error in logout:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
  return res
    .status(200)
    .json({ success: true, message: "User logged out successfully" });
};

// Send verification OTP to the user's email
export const sendVerifyOTP = async (req, res) => {
  try {
    console.log("Request body: ", req.body);

    
    const { email } = req.body; // Only email required now
    const userId = req.userId; // Get userId from token

    // Validate input
    if (!userId || !email) {
      return res
        .status(400)
        .json({ success: false, message: "User ID and email are required" });
    }
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if the account is already verified
    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Account already verified" });
    }
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP: ", otp);

    // Save the OTP to the user's record 
    user.verifyOTP = otp; // Store the OTP in the user's record
    user.verifyOTPExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    await user.save();

    // Send the OTP via email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Verify Your Account",
      text: `Your verification OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.`,
    };
    await transporter
      .sendMail(mailOptions);
    console.log("Verification OTP sent successfully");
    return res
      .status(200)
      .json({ success: true, message: "Verification OTP sent successfully" });
  } catch (error) {
    console.error("Error in sendVerifyOTP:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Verify the user's email using the OTP
export const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.userId; // Get userId from token

    // Validate input
    if (!userId || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "User ID and OTP are required" });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if the OTP is valid and not expired
    if (user.verifyOTP !== otp || Date.now() > user.verifyOTPExpires) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }
    // Mark the user as verified
    user.isVerified = true;
    user.verifyOTP = ""; // Clear the OTP after verification
    user.verifyOTPExpires = 0; // Clear the expiration time
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Account verified successfully" });
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Check if the user is authenticated
export const isAuthenticated = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }
    return res 
        .status(200)
        .json({ success: true, message: "User is authenticated" });
  } catch (error) {
    console.error("Error in isAuthenticated:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

// Sned reset OTP to the user's email
export const sendResetOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated Reset OTP: ", otp);

    // Save the OTP to the user's record
    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 15 * 60 * 1000; // OTP valid for 10 minutes
    await user.save();

    // Send the OTP via email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Reset Your Password",
      text: `Your password reset OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.`,
    };
    await transporter.sendMail(mailOptions);
    
    console.log("Password reset OTP sent successfully");
    return res
      .status(200)
      .json({ success: true, message: "Password reset OTP sent successfully" });
  } catch (error) {
    console.error("Error in sendResetOTP:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

// Reset the user's password using the OTP
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Email, OTP and new password are required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if the OTP is valid and not expired
    if (user.resetOTP === "" || user.resetOTP !== otp || Date.now() > user.resetOTPExpires) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    // Hash the new password and save it
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOTP = ""; // Clear the OTP after reset
    user.resetOTPExpires = 0; // Clear the expiration time
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });

    // Send the Password reset email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Your Password has been Reset",
      text: `Your password has been reset successfully.`,
    };
    await transporter.sendMail(mailOptions);
    
    console.log("Password reset successfully");
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}