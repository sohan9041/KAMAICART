import jwt from "jsonwebtoken";

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

export const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      req.user = null; // no login
      return next();
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // logged in user
    next();
  } catch (err) {
    req.user = null; // invalid token, treat as guest
    next();
  }
};

export const cookiesverifyUser = (req, res, next) => {
  // Get token from cookies instead of headers
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(403).json({ msg: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info

    next();
  } catch (err) {
    return res.status(403).json({ msg: "Invalid or expired token" });
  }
};
