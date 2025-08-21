import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import apiResponse from "../Helper/apiResponse.js";
import {
  User,
  Register,
  findUserByEmailorPhone,
  Updatepassword,
} from "../Models/userModel.js";

// Temporary OTP store
const tempUsers = {};

// ✅ Signup
export const Signup = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !phone || !password || !role) {
      return apiResponse.validationErrorWithData(
        res,
        "All fields are required",
        { name, email, phone, role }
      );
    }

    const existingUser = await findUserByEmailorPhone(email);
    if (existingUser)
      return apiResponse.validationErrorWithData(
        res,
        "Email or phone already exists",
        { email }
      );

    const hashed = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    tempUsers[email] = {
      name,
      email,
      phone,
      hashed,
      role,
      otp,
      expires: Date.now() + 5 * 60 * 1000,
    };

    await Register(name, email, phone, hashed, role);

    return apiResponse.successResponseWithData(res, "OTP sent successfully", {
      email,
      otp,
    });
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

// ✅ Signin
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

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return apiResponse.successResponseWithData(res, "Login successful", {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
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
    console.log(err);
    return apiResponse.forbiddenResponse(res, "Invalid or expired token");
  }
};

// ✅ Logout
export const Logout = (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "lax" });
  return apiResponse.successResponseWithData(
    res,
    "Logged out successfully",
    null
  );
};

export const getSellers = async (req, res) => {
  try {
    const sellers = await User.findAll({
      where: { role: "seller" },
      attributes: ["id", "name", "email", "phoneno"], // only safe fields
    });

    if (!sellers || sellers.length === 0) {
      return apiResponse.notFoundResponse(res, "No sellers found",[]);
    }

    return apiResponse.successResponseWithData(
      res,
      "Sellers fetched successfully",
      sellers
    );
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return apiResponse.ErrorResponse(res, "Failed to fetch sellers", error.message);
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
    return apiResponse.ErrorResponse(res, "Failed to fetch customers", error.message);
  }
};
