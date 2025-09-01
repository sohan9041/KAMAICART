// helpers/tokenHelper.js
import jwt from "jsonwebtoken";
import Token from "../Schema/token.js";

// ---------- get client's IP ----------
export const getClientIp = (req) => {
  return (
    (req.headers["x-forwarded-for"] ||
      req.connection?.remoteAddress ||
      req.ip ||
      "")
      .split(",")[0]
      .trim()
  );
};

// ---------- get device (either body param or User-Agent) ----------
export const getDevice = (req) => {
  return req.body?.device || req.headers["user-agent"] || "unknown";
};

// ---------- extract expiry date from JWT (without verify) ----------
export const getTokenExpiryDate = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return null;
    return new Date(decoded.exp * 1000); // convert seconds -> ms
  } catch (err) {
    return null;
  }
};

// ---------- persist refresh token in DB ----------
export const saveRefreshTokenRecord = async ({ user, tokenValue, req }) => {
  const expiresAt = getTokenExpiryDate(tokenValue);
  return Token.create({
    user_id: user.id,
    user_type: user.role_id ? String(user.role_id) : null,
    token: tokenValue,
    device: getDevice(req),
    ip_address: getClientIp(req),
    expires_at: expiresAt,
    revoked: false,
  });
};
