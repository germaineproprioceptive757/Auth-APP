import User from "../models/userModel.js";

export const getUserData = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "User ID not found in request" });
    }

    const userId = req.userId;
    const user = await User.findById(userId).select("-password -__v -resetOTP -resetOTPExpires -verifyOTP -verifyOTPExpires"); // Exclude sensitive fields
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ 
      success: true, 
      userData: {
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      } 
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: "Invalid user ID format" });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}