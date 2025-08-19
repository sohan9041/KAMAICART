import jwt from "jsonwebtoken";

export const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ msg: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.id = decoded.id;

    next();
  } catch (err) {
    return res.status(403).json({ msg: "Invalid token" });
  }
};
