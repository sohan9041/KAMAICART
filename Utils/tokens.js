// utils/tokens.js
import jwt from "jsonwebtoken";

export const signAccessToken = (user) =>
  jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m" }
  );

export const signRefreshToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  });

export const generateTokens = (user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  return { accessToken, refreshToken };
};

// decode token without verifying to read exp (seconds)
export const getTokenExpiryDate = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return null;
    return new Date(decoded.exp * 1000);
  } catch (e) {
    return null;
  }
};


// ✅ Function to set Access Token Cookie
export const setAccessTokenCookie = (res, accessToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
    maxAge: parseExpiry(process.env.ACCESS_TOKEN_EXPIRES_IN),
  });
};

// ✅ Function to set Refresh Token Cookie
export const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
    maxAge: parseExpiry(process.env.REFRESH_TOKEN_EXPIRES_IN),
  });
};

// ✅ Wrapper function to set both cookies
export const setAuthCookies = (res, accessToken, refreshToken) => {
  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, refreshToken);
};


// helper to convert "15m" or "7d" → milliseconds
function parseExpiry(exp) {
  const num = parseInt(exp, 10);
  if (exp.includes("m")) return num * 60 * 1000;
  if (exp.includes("h")) return num * 60 * 60 * 1000;
  if (exp.includes("d")) return num * 24 * 60 * 60 * 1000;
  return num; // fallback in ms
}

