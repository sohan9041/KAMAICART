import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { Admin } from "../Models/admin.js";
import apiResponse from "../Helper/apiResponse.js";
import {
  generateTokens,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
  setAccessTokenCookie
} from "../Utils/tokens.js";
import {
  saveRefreshTokenRecord
} from "../Helper/tokenHelper.js";

// 🔹 Create Admin
export const createAdmin = async (req, res) => {
  try {
    const { name, email, phoneno, password } = req.body;

    if (!name || !email || !phoneno || !password) {
      return apiResponse.validationErrorWithData(res, "All fields are required", null);
    }

    const existing = await Admin.findOne({
      where: { [Op.or]: [{ email }, { phoneno }] },
    });
    if (existing) {
      return apiResponse.validationErrorWithData(res, "Email or Phone already exists", null);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const record = await Admin.create({
      name,
      email,
      phoneno,
      password: hashedPassword,
    });

    return apiResponse.successResponseWithData(res, "Admin created successfully", {
      id: record.id,
      name: record.name,
      email: record.email,
      phoneno: record.phoneno,
      status: record.status,
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// 🔹 List Admins with filters + pagination
export const getAdminList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const filters = {};
    if (req.query.name) filters.name = { [Op.like]: `%${req.query.name}%` };
    if (req.query.email) filters.email = { [Op.like]: `%${req.query.email}%` };
    if (req.query.phoneno) filters.phoneno = { [Op.like]: `%${req.query.phoneno}%` };
    if (req.query.status) filters.status = req.query.status;

    const { count, rows } = await Admin.findAndCountAll({
      where: { ...filters, is_deleted: false },
      limit,
      offset,
      order: [["id", "DESC"]],
      attributes: { exclude: ["password"] },
    });

    return apiResponse.successResponseWithData(res, "Fetched successfully", rows, {
      totalItems: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      pageSize: limit,
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// 🔹 Get Admin by ID
export const getAdminById = async (req, res) => {
  try {
    const record = await Admin.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });
    if (!record) return apiResponse.notFoundResponse(res, "Admin not found", null);

    return apiResponse.successResponseWithData(res, "Fetched successfully", record);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// 🔹 Update Admin
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Admin.findByPk(id);
    if (!record) return apiResponse.notFoundResponse(res, "Admin not found", null);

    let updateData = { ...req.body };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await record.update(updateData);

    const { password, ...safeData } = record.dataValues;

    return apiResponse.successResponseWithData(res, "Admin updated successfully", safeData);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// 🔹 Delete Admin (Soft Delete)
export const deleteAdmin = async (req, res) => {
  try {
    const record = await Admin.findByPk(req.params.id);
    if (!record) return apiResponse.notFoundResponse(res, "Admin not found", null);

    await record.update({ is_deleted: true });

    return apiResponse.successResponseWithData(res, "Admin deleted successfully");
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// 🔹 Admin Login
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return apiResponse.validationErrorWithData(res, "Email/Phone and Password required", null);
    }

    // ✅ Find admin by email or phone
    const admin = await Admin.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { phoneno: identifier }],
        is_deleted: false,
      },
    });

    if (!admin) {
      return apiResponse.notFoundResponse(res, "Admin not found");
    }

    // ✅ Check password
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return apiResponse.validationErrorWithData(res, "Password incorrect", null);
    }

    // ✅ Check status
    if (admin.status !== "active") {
      return apiResponse.validationErrorWithData(res, "Admin account is inactive", null);
    }

    // ✅ Generate tokens
    const { accessToken, refreshToken } = generateTokens(admin);
    await saveRefreshTokenRecord({ user: admin, tokenValue: refreshToken, req });
    setAuthCookies(res, accessToken, refreshToken);

    return apiResponse.successResponseWithData(res, "Admin login successful", {
      accessToken,
      refreshToken,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phoneno: admin.phoneno
      },
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

export const logout = async (req, res) => {
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
