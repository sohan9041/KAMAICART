import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import {
  User,
  saveUser,
  getAllUsers,
  getUserByIdModel,
  updateUserModel,
  softDeleteUser,
  toggleUserStatusModel
} from "../Models/userModel.js";
import apiResponse from "../Helper/apiResponse.js";

// 🔹 Create User
export const createUser = async (req, res) => {
  try {
    const { name, email, phoneno, password } = req.body;

    if (!name || !email || !phoneno || !password) {
      return apiResponse.validationErrorWithData(res, "All fields are required", null);
    }

    const role_id = 4;

    // ✅ Check if email or phone number already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { phoneno }]
      }
    });

    if (existingUser) {
      let msg = "User already exists";
      if (existingUser.email === email) msg = "Email already exists";
      if (existingUser.phoneno === phoneno) msg = "Phone number already exists";
      return apiResponse.validationErrorWithData(res, msg, null);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const record = await saveUser({
      name,
      email,
      phoneno,
      password: hashedPassword,
      role_id
    });

    return apiResponse.successResponseWithData(res, "User created successfully", {
      id: record.id,
      name: record.name,
      email: record.email,
      phoneno: record.phoneno,
      role_id: record.role_id,
      status: record.status
    });
  } catch (err) {
    console.log(err);
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// 🔹 Toggle User Status
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedUser = await toggleUserStatusModel(id, status);
    if (!updatedUser) {
      return apiResponse.notFoundResponse(res, "User not found", null);
    }

    return apiResponse.successResponseWithData(
      res,
      `User status updated to ${updatedUser.status}`,
      updatedUser
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// 🔹 Get All Users (with pagination)
export const getUserList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Filters
    const filters = {
      name: req.query.name || null,
      email: req.query.email || null,
      phoneno: req.query.phoneno || null,
      status: req.query.user_status || null,
    };

    const { count, rows } = await getAllUsers(page, limit, filters);

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


// 🔹 Get User by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserByIdModel(id);
    if (!user) return apiResponse.notFoundResponse(res, "User not found", null);

    return apiResponse.successResponseWithData(res, "Fetched successfully", user);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// 🔹 Update User
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserByIdModel(id);
    if (!user) return apiResponse.notFoundResponse(res, "User not found", null);

    let updateData = { ...req.body };

    // ✅ Handle password update
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await updateUserModel(id, updateData);

    const { password, ...safeUser } = updatedUser.dataValues;

    return apiResponse.successResponseWithData(res, "User updated successfully", safeUser);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// 🔹 Delete User (Soft Delete)
export const deleteUser = async (req, res) => {
  try {
    const record = await softDeleteUser(req.params.id);
    if (!record) return apiResponse.notFoundResponse(res, "User not found", null);

    return apiResponse.successResponseWithData(res, "User deleted successfully");
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};
