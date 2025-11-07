import jwt from "jsonwebtoken";

export const userAuth = (req, res, next) => {
  const { token } = req.cookies;
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Not Authorized. Login Again" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.id) {
      req.userId = decoded.id;
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized. Login Again" });
    }
    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    return res.status(401).json({ 
      success: false, 
      message: "Not Authorized. Token is invalid or expired" 
    });
  }
};

export const userAuthWithRole = (req, res, next) => {
  const token = extractToken(req);
  if (!token) return handleUnauthorized(res, "No token provided");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.id && decoded.role) {
      req.body.userId = decoded.id;
      req.body.role = decoded.role;
      return next();
    }
  } catch (error) {
    // Log error if needed
  }
  return handleUnauthorized(res);
};
