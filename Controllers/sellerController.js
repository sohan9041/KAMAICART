import {
  saveSeller,
  getAllSellers,
  getSellerByIdModel,
  updateSellerModel,
  softDeleteSeller,
  toggleSellerStatusModel
} from "../Models/sellerModel.js";
import apiResponse from "../Helper/apiResponse.js";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";

// 🔹 Create Seller
export const createSeller = async (req, res) => {
  try {
    const { name, email, phoneno, password, role_id } = req.body;

    if (!name || !email || !phoneno || !password || !role_id) {
      return apiResponse.validationErrorWithData(res, "All fields are required", null);
    }

    if (![2, 3].includes(role_id)) {
      return apiResponse.validationErrorWithData(res, "Invalid role_id for seller", null);
    }

    // ✅ Check if email or phone already exists
    const existingSeller = await User.findOne({
      where: {
        role_id: [2, 3],
        [Op.or]: [{ email }, { phoneno }]
      }
    });

    if (existingSeller) {
      let msg = "Seller already exists";
      if (existingSeller.email === email) msg = "Email already exists";
      if (existingSeller.phoneno === phoneno) msg = "Phone number already exists";
      return apiResponse.validationErrorWithData(res, msg, null);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const record = await saveSeller({
      name,
      email,
      phoneno,
      password: hashedPassword,
      role_id
    });

    return apiResponse.successResponseWithData(res, "Seller created successfully", {
      id: record.id,
      name: record.name,
      email: record.email,
      phoneno: record.phoneno,
      role_id: record.role_id,
      status: record.status
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

export const toggleSellerStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    const updatedSeller = await toggleSellerStatusModel(id,status);
    if (!updatedSeller) {
      return apiResponse.notFoundResponse(res, "Seller not found", null);
    }

    return apiResponse.successResponseWithData(
      res,
      `Seller status updated to ${updatedSeller.status}`,
      updatedSeller
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// 🔹 Get All Sellers
export const getSellerList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { count, rows } = await getAllSellers(page, limit);

    return apiResponse.successResponseWithData(res, "Fetched successfully",rows, {
        totalItems: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        pageSize: limit,
    });
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// 🔹 Get Seller by ID
export const getSellerById = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await getSellerByIdModel(id);
    if (!seller) return apiResponse.notFoundResponse(res, "Seller not found", null);

    return apiResponse.successResponseWithData(res, "Fetched successfully", seller);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// 🔹 Update Seller
export const updateSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await getSellerByIdModel(id);
    if (!seller) return apiResponse.notFoundResponse(res, "Seller not found", null);

    const updatedSeller = await updateSellerModel(id, req.body);
    return apiResponse.successResponseWithData(res, "Seller updated successfully", updatedSeller);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// 🔹 Delete Seller (Soft Delete)
export const deleteSeller = async (req, res) => {
  try {
    const record = await softDeleteSeller(req.params.id);
    if (!record) return apiResponse.notFoundResponse(res, "Seller not found", null);

    return apiResponse.successResponseWithData(res, "Seller deleted successfully");
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};
