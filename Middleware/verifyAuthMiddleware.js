import jwt from "jsonwebtoken";

// 🔒 Strict auth via Authorization header (Bearer token)
export const verifyUser = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token)
    return res.status(200).json({ status: false, message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(200).json({ status: false, message: "Invalid token" });
  }
};

// 🟢 Optional auth via Authorization header
export const optionalAuthHeader = (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      req.user = null; // guest
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // logged in
  } catch (err) {
    req.user = null; // invalid token, treat as guest
  }

  next();
};

// 🔒 Strict auth via Cookies
export const cookiesVerifyUser = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(403).json({ msg: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ msg: "Invalid or expired token" });
  }
};

// 🟢 Optional auth via Cookies
export const optionalAuthCookie = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    req.user = null; // guest
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    req.user = null;
  }

  next();
};
