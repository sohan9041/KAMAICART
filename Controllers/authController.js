import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import apiResponse from "../Helper/apiResponse.js";
import appapiResponse from "../Helper/appapiResponse.js";
import Token from "../Schema/token.js";
import {
  User,
  Register,
  findUserByEmailorPhone,
  findUserByEmailorPhoneByApp,
  Updatepassword,
  AppRegister,
} from "../Models/userModel.js";
import {
  generateTokens,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
  setAccessTokenCookie,
} from "../Utils/tokens.js";
import { saveRefreshTokenRecord } from "../Helper/tokenHelper.js";
import { Admin } from "../Models/admin.js";
// Temporary OTP store
const tempUsers = {};
export const Signup = async (req, res) => {
  try {
    const { name, email, phone, password, role_id } = req.body;
    if (!name || !email || !phone || !password || !role_id) {
      return apiResponse.validationErrorWithData(
        res,
        "All fields are required",
        {
          name,
          email,
          phone,
          role_id,
        }
      );
    }
    const existingUser = await findUserByEmailorPhoneByApp(email, phone);
    if (existingUser) {
      return apiResponse.validationErrorWithData(
        res,
        "Email or phone already exists",
        { email, phone }
      );
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await Register(name, email, phone, hashed, role_id);
    // generate tokens and store refresh record
    const { accessToken, refreshToken } = generateTokens(user);
    // res.cookie("accessToken", accessToken, {
    //   httpOnly: true, // cannot be accessed by JS
    //   secure: process.env.NODE_ENV === "production", //process.env.NODE_ENV === "production", // only over HTTPS in prod
    //   sameSite: process.env.NODE_ENV === "production" ? "None" : "lax", //process.env.NODE_ENV === "production" ? "None" : "Lax",
    //   maxAge: 15 * 60 * 1000, // 15 minutes
    // });

    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production", //process.env.NODE_ENV === "production",
    //   sameSite: process.env.NODE_ENV === "production" ? "None" : "lax", //process.env.NODE_ENV === "production" ? "None" : "Lax",
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // });
    setAuthCookies(res, accessToken, refreshToken);
    await saveRefreshTokenRecord({ user, tokenValue: refreshToken, req });
    return apiResponse.successResponseWithData(res, "Signup successful", {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        //phone: user.phone,
        role: user.role_id,
      },
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};
// ---------------- SIGNIN ----------------
export const Signin = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await findUserByEmailorPhone(identifier);
    if (!user) return apiResponse.notFoundResponse(res, "User not found");
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return apiResponse.validationErrorWithData(
        res,
        "Password incorrect",
        null
      );
    const { accessToken, refreshToken } = generateTokens(user);
    await saveRefreshTokenRecord({ user, tokenValue: refreshToken, req });
    setAuthCookies(res, accessToken, refreshToken);

    return apiResponse.successResponseWithData(res, "Login successful", {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        //phone: user.phoneno,
        role: user.role_id,
      },
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};
// ---------------- REFRESH ----------------
// Accepts { refreshToken } in body. Rotates refresh token (old -> revoked, new stored)
export const RefreshToken = async (req, res) => {
  try {
    // ✅ Read refresh token from cookies instead of headers
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return apiResponse.unauthorizedResponse(res, "Refresh token is required");
    }

    // Verify signature & get payload
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err)
          return apiResponse.ErrorResponse(
            res,
            "Invalid or expired refresh token"
          );

        // Make sure token exists in DB and not revoked
        const tokenRecord = await Token.findOne({
          where: { token: refreshToken },
        });
        if (!tokenRecord || tokenRecord.revoked) {
          return apiResponse.ErrorResponse(
            res,
            "Refresh token revoked or not found"
          );
        }

        // Optional: check expiry server-side
        if (
          tokenRecord.expires_at &&
          new Date(tokenRecord.expires_at) <= new Date()
        ) {
          tokenRecord.revoked = true;
          await tokenRecord.save();
          return apiResponse.ErrorResponse(res, "Refresh token expired");
        }

        // fetch user
        const user = await User.findByPk(decoded.id);
        const admin = await Admin.findByPk(decoded.id);

        // ✅ If neither user nor admin exists → return not found
        if (!user && !admin) {
          return apiResponse.notFoundResponse(res, "User not found");
        }

        // ✅ Determine who is logged in
        const account = user || admin;

        // ✅ Generate new access token
        const newAccessToken = signAccessToken(account);

        // const newRefreshToken = signRefreshToken(user);

        // ✅ Reset cookies with new tokens
        setAccessTokenCookie(res, newAccessToken);
        // res.cookie("accessToken", newAccessToken, {
        //   httpOnly: true,
        //   secure: process.env.NODE_ENV === "production",
        //   sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
        //   maxAge: 15 * 60 * 1000, // 15 minutes
        // });

        return apiResponse.successResponseWithData(res, "Token refreshed", {
          accessToken: newAccessToken,
          refreshToken: refreshToken,
        });
      }
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// You can pass `x-refresh-token` in header, or revoke all tokens for the current user
export const Logout = async (req, res) => {
  try {
    const decoded = req.user; // requires verifyUser (access token)
    const refreshToken = req.cookies?.refreshToken; // support both header & cookie

    if (refreshToken) {
      await Token.update({ revoked: true }, { where: { user_id: decoded.id } });

      // remove refresh token cookie
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // set to true if using HTTPS
        sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
      });

      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // set to true if using HTTPS
        sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
      });

      return apiResponse.successResponseWithData(
        res,
        "All sessions revoked",
        null
      );
    }

    const tokenRecord = await Token.findOne({
      where: { token: refreshToken, user_id: decoded.id },
    });
    if (!tokenRecord)
      return apiResponse.notFoundResponse(res, "Token not found");

    tokenRecord.revoked = true;
    await tokenRecord.save();

    return apiResponse.successResponseWithData(
      res,
      "Logged out (session revoked)",
      null
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Verify OTP
export const VerifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const tempUser = tempUsers[email];
  if (!tempUser || tempUser.otp !== otp || tempUser.expires < Date.now()) {
    return apiResponse.validationErrorWithData(res, "Invalid or expired OTP", {
      email,
    });
  }
  await User.update({ isVerified: true }, { where: { email } });
  delete tempUsers[email];
  return apiResponse.successResponseWithData(
    res,
    "User verified successfully",
    { email }
  );
};
// ✅ Reset Password Flow
export const sendResetPassOTP = async (req, res) => {
  const { email } = req.body;
  const user = await findUserByEmailorPhone(email);
  if (!user) return apiResponse.notFoundResponse(res, "User not found");
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  tempUsers[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };
  return apiResponse.successResponseWithData(res, "OTP sent", { email, otp });
};
export const verifyResetOTP = async (req, res) => {
  const { email, otp } = req.body;
  const tempUser = tempUsers[email];
  if (!tempUser || tempUser.otp !== otp || tempUser.expires < Date.now()) {
    return apiResponse.validationErrorWithData(res, "Invalid or expired OTP", {
      email,
    });
  }
  return apiResponse.successResponseWithData(res, "OTP verified", { email });
};
export const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  const tempUser = tempUsers[email];
  if (!tempUser || tempUser.expires < Date.now())
    return apiResponse.validationErrorWithData(
      res,
      "OTP expired or not verified",
      { email }
    );
  const hashed = await bcrypt.hash(password, 10);
  await Updatepassword(email, hashed);
  delete tempUsers[email];
  return apiResponse.successResponseWithData(
    res,
    "Password updated successfully",
    { email }
  );
};
// ✅ Profile
export const profile = async (req, res) => {
  try {
    const decoded = req.user;
    const user = await User.findOne({
      where: { id: decoded.id },
      attributes: { exclude: ["password"] },
    });
    if (!user) return apiResponse.notFoundResponse(res, "User not found");
    return apiResponse.successResponseWithData(res, "Profile fetched", user);
  } catch (err) {
    return apiResponse.forbiddenResponse(res, "Invalid or expired token");
  }
};

//update profile
export const updateProfile = async (req, res) => {
  try {
    const decoded = req.user;
    const { name, phone } = req.body;
    const user = await User.findOne({ where: { id: decoded.id } });
    if (!user) return apiResponse.notFoundResponse(res, "User not found");
    user.name = name || user.name;
    user.phoneno = phone || user.phoneno;
    await user.save();
    return apiResponse.successResponseWithData(res, "Profile updated", user);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

export const getSellers = async (req, res) => {
  try {
    const sellers = await User.findAll({
      where: { role: "seller" },
      attributes: ["id", "name", "email", "phoneno"], // only safe fields
    });
    if (!sellers || sellers.length === 0) {
      return apiResponse.notFoundResponse(res, "No sellers found", []);
    }
    return apiResponse.successResponseWithData(
      res,
      "Sellers fetched successfully",
      sellers
    );
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return apiResponse.ErrorResponse(
      res,
      "Failed to fetch sellers",
      error.message
    );
  }
};
// ✅ Get Customers
export const getCustomers = async (req, res) => {
  try {
    const customers = await User.findAll({
      where: { role: "customer" },
      attributes: ["id", "name", "email", "phoneno"], // only safe fields
    });
    if (!customers || customers.length === 0) {
      return apiResponse.notFoundResponse(res, "No customers found");
    }
    return apiResponse.successResponseWithData(
      res,
      "Customers fetched successfully",
      customers
    );
  } catch (error) {
    console.error("Error fetching customers:", error);
    return apiResponse.ErrorResponse(
      res,
      "Failed to fetch customers",
      error.message
    );
  }
};
// ✅ Signup (Direct login after register)
export const AppSignup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return appapiResponse.validationErrorWithData(
        res,
        "All fields are required",
        { name, email, phone }
      );
    }
    // check duplicate user
    const existingUser = await findUserByEmailorPhoneByApp(email, phone);
    if (existingUser) {
      return appapiResponse.validationErrorWithData(
        res,
        "Email or phone already exists",
        { email, phone }
      );
    }
    // hash password
    const hashed = await bcrypt.hash(password, 10);
    // register user in DB
    const user = await AppRegister(name, email, phone, hashed, 4);
    // generate JWT token immediately after signup
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return appapiResponse.successResponseWithData(res, "Signup successful", {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role_id,
        profileImage: "",
      },
    });
  } catch (err) {
    return appapiResponse.ErrorResponse(res, err.message);
  }
};
// ✅ Signin
export const AppSignin = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await findUserByEmailorPhone(identifier);
    if (!user) return appapiResponse.notFoundResponse(res, "User not found");
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return appapiResponse.validationErrorWithData(
        res,
        "Password incorrect",
        null
      );
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return appapiResponse.successResponseWithData(res, "Login successful", {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phoneno,
        role: user.role_id,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    return appapiResponse.ErrorResponse(res, err.message);
  }
};
// ✅ Logout
export const AppLogout = (req, res) => {
  return appapiResponse.successResponseWithData(
    res,
    "Logged out successfully",
    null
  );
};
// ✅ Profile
export const AppProfile = async (req, res) => {
  try {
    const decoded = req.user;
    const user = await User.findOne({
      where: { id: decoded.id },
      attributes: { exclude: ["password"] },
    });
    if (!user) return appapiResponse.notFoundResponse(res, "User not found");
    return appapiResponse.successResponseWithData(res, "Profile fetched", {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phoneno,
      role: user.role_id,
      profileImage: user.profileImage,
    });
  } catch (err) {
    return appapiResponse.forbiddenResponse(res, "Invalid or expired token");
  }
};
export const uploadUserImage = async (req, res) => {
  try {
    if (!req.file) {
      return appapiResponse.ErrorResponse(res, "No file uploaded");
    }
    const decoded = req.user;
    const user = await User.findOne({ where: { id: decoded.id } });
    if (!user) {
      return appapiResponse.notFoundResponse(res, "User not found");
    }
    // Save image path in DB
    user.profileImage = `/uploads/user/${req.file.filename}`;
    await user.save();
    return appapiResponse.successResponseWithData(
      res,
      "Profile image uploaded",
      {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phoneno,
        role: user.role_id,
        profileImage: user.profileImage,
      }
    );
  } catch (error) {
    return appapiResponse.ErrorResponse(res, "Something went wrong");
  }
};

//update profile
export const AppUpdateProfile = async (req, res) => {
  try {
    const decoded = req.user;
    const { name, phone } = req.body;
    const user = await User.findOne({ where: { id: decoded.id } });
    if (!user) return appapiResponse.notFoundResponse(res, "User not found");
    user.name = name || user.name;
    user.phoneno = phone || user.phoneno;
    //user.email = email || user.email; // prevent email change
    await user.save();
    return appapiResponse.successResponseWithData(res, "Profile updated", {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phoneno,
      role: user.role_id,
      profileImage: user.profileImage,
    });
  } catch (err) {
    return appapiResponse.ErrorResponse(res, err.message);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return appapiResponse.validationErrorWithData(res, "Email is required");

    const user = await User.findOne({ where: { email } });
    if (!user) return appapiResponse.notFoundResponse(res, "User not found");

    // Static OTP (later you can generate random one)
    const otp = "123456";
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    await user.update({ otp, otp_expiry: expiry });

    return appapiResponse.successResponseWithData(
      res,
      "OTP sent successfully",
      email
    );
  } catch (err) {
    return appapiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return appapiResponse.validationErrorWithData(
        res,
        "Email and OTP are required"
      );

    const user = await User.findOne({ where: { email } });
    if (!user) return appapiResponse.notFoundResponse(res, "User not found");

    if (user.otp !== otp) {
      return appapiResponse.successResponseWithData(res, "Invalid OTP");
    }

    if (new Date() > new Date(user.otp_expiry)) {
      return appapiResponse.successResponseWithData(res, "OTP expired");
    }

    return appapiResponse.successResponseWithData(
      res,
      "OTP verified successfully"
    );
  } catch (err) {
    return appapiResponse.ErrorResponse(res, err.message);
  }
};

export const AppresetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      return appapiResponse.validationErrorWithData(
        res,
        "Email and new password are required"
      );

    const user = await User.findOne({ where: { email } });
    if (!user) return appapiResponse.notFoundResponse(res, "User not found");

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({
      password: hashedPassword,
      otp: null, // clear OTP
      otp_expiry: null,
    });

    return appapiResponse.successResponseWithData(
      res,
      "Password reset successfully"
    );
  } catch (err) {
    return appapiResponse.ErrorResponse(res, err.message);
  }
};

export const AppupdatePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
      return appapiResponse.validationErrorWithData(
        res,
        "Email, current password and new password are required"
      );
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return appapiResponse.notFoundResponse(res, "User not found");
    }

    // Compare current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return appapiResponse.validationErrorWithData(
        res,
        "Current password is incorrect",
        null
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({
      password: hashedPassword,
      otp: null,
      otp_expiry: null,
    });

    return appapiResponse.successResponseWithData(
      res,
      "Password updated successfully"
    );
  } catch (err) {
    return appapiResponse.ErrorResponse(res, err.message);
  }
};

/* web */
export const webforgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return apiResponse.validationErrorWithData(res, "Email is required");

    const user = await User.findOne({ where: { email } });
    if (!user) return apiResponse.notFoundResponse(res, "User not found");

    // Static OTP (later you can generate random one)
    const otp = "123456";
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    await user.update({ otp, otp_expiry: expiry });

    return apiResponse.successResponseWithData(
      res,
      "OTP sent successfully",
      email
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

export const webverifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return apiResponse.validationErrorWithData(
        res,
        "Email and OTP are required"
      );

    const user = await User.findOne({ where: { email } });
    if (!user) return apiResponse.notFoundResponse(res, "User not found");

    if (user.otp !== otp) {
      return apiResponse.successResponseWithData(res, "Invalid OTP");
    }

    if (new Date() > new Date(user.otp_expiry)) {
      return apiResponse.successResponseWithData(res, "OTP expired");
    }

    return apiResponse.successResponseWithData(
      res,
      "OTP verified successfully"
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

export const webresetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      return apiResponse.validationErrorWithData(
        res,
        "Email and new password are required"
      );

    const user = await User.findOne({ where: { email } });
    if (!user) return apiResponse.notFoundResponse(res, "User not found");

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({
      password: hashedPassword,
      otp: null, // clear OTP
      otp_expiry: null,
    });

    return apiResponse.successResponseWithData(
      res,
      "Password reset successfully"
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

export const webupdatePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
      return apiResponse.validationErrorWithData(
        res,
        "Email, current password and new password are required"
      );
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return apiResponse.notFoundResponse(res, "User not found");
    }

    // Compare current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return apiResponse.validationErrorWithData(
        res,
        "Current password is incorrect",
        null
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({
      password: hashedPassword,
      otp: null,
      otp_expiry: null,
    });

    return apiResponse.successResponseWithData(
      res,
      "Password updated successfully"
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};
