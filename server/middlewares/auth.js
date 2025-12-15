import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  try {
    const token = req.headers.token;

    if (!token) {
      return res.json({ success: false, message: "Not Authorized. Login Again" });
    }

    const decoded = jwt.decode(token);

    if (!decoded?.clerkId) {
      return res.json({ success: false, message: "Invalid token" });
    }

    // ✅ SAFE: attach to req, not req.body
    req.clerkId = decoded.clerkId;

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export default authUser;
