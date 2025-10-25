import {
  saveSeller,
  getAllSellers,
  getSellerByIdModel,
  updateSellerModel,
  softDeleteSeller,
  toggleSellerStatusModel,
  User,
  SellerProfile,
} from "../Models/sellerModel.js";
import apiResponse from "../Helper/apiResponse.js";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { Role } from "../Schema/role.js";

// 🔹 Create Seller
export const createSeller = async (req, res) => {
  try {
    const { name, email, phoneno, password, role_id } = req.body;

    if (!name || !email || !phoneno || !password || !role_id) {
      return apiResponse.validationErrorWithData(
        res,
        "All fields are required",
        null
      );
    }

    if (![2, 3].includes(role_id)) {
      return apiResponse.validationErrorWithData(
        res,
        "Invalid role_id for seller",
        null
      );
    }

    // ✅ Check if email or phone already exists
    const existingSeller = await User.findOne({
      where: {
        role_id: [2, 3],
        [Op.or]: [{ email }, { phoneno }],
      },
    });

    if (existingSeller) {
      let msg = "Seller already exists";
      if (existingSeller.email === email) msg = "Email already exists";
      if (existingSeller.phoneno === phoneno)
        msg = "Phone number already exists";
      return apiResponse.validationErrorWithData(res, msg, null);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const record = await saveSeller({
      name,
      email,
      phoneno,
      password: hashedPassword,
      role_id,
    });

    return apiResponse.successResponseWithData(
      res,
      "Seller created successfully",
      {
        id: record.id,
        name: record.name,
        email: record.email,
        phoneno: record.phoneno,
        role_id: record.role_id,
        status: record.status,
      }
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

export const toggleSellerStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    const updatedSeller = await toggleSellerStatusModel(id, status);
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

    // Extract filters
    const filters = {
      name: req.query.name,
      email: req.query.email,
      phoneno: req.query.phoneno,
      status: req.query.status,
      role_id: req.query.role_id
    };

    const { count, rows } = await getAllSellers(page, limit, filters);

    return apiResponse.successResponseWithData(
      res,
      "Fetched successfully",
      rows,
      {
        totalItems: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        pageSize: limit,
      }
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};


// 🔹 Get Seller by ID
export const getSellerById = async (req, res) => {
  try {
    const { id } = req.params;

    let seller = await getSellerByIdModel(id);

    if (!seller) {
      return apiResponse.notFoundResponse(res, "Seller not found", null);
    }

    // Convert Sequelize instance to plain object
    seller = seller.toJSON();

    // Move email, phone, status into sellerProfile
    seller.sellerProfile = {
      ...seller.sellerProfile,
      email: seller.email,
      phone: seller.phoneno,
      status: seller.status,
    };

    // (Optional) Remove from root if you don’t want duplicates
    delete seller.email;
    delete seller.phoneno;
    delete seller.status;

    return apiResponse.successResponseWithData(
      res,
      "Fetched successfully",
      seller
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// 🔹 Update Seller
export const updateSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await getSellerByIdModel(id);
    if (!seller)
      return apiResponse.notFoundResponse(res, "Seller not found", null);

    const updatedSeller = await updateSellerModel(id, req.body);
    return apiResponse.successResponseWithData(
      res,
      "Seller updated successfully",
      updatedSeller
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// 🔹 Delete Seller (Soft Delete)
export const deleteSeller = async (req, res) => {
  try {
    const record = await softDeleteSeller(req.params.id);
    if (!record)
      return apiResponse.notFoundResponse(res, "Seller not found", null);

    return apiResponse.successResponseWithData(
      res,
      "Seller deleted successfully"
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

export const sellerRegistration = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      email,
      pincode,
      shopName,
      shopAddress,
      pickupAddress,
      state,
      city,
      gstNumber,
      bankName,
      ifsc,
      accountNumber,
      password,
    } = req.body;

    // ✅ Basic validations
    if (
      !firstName ||
      !phone ||
      !email ||
      !shopName ||
      !shopAddress ||
      !pickupAddress ||
      !state ||
      !city ||
      !bankName ||
      !pincode ||
      !ifsc ||
      !accountNumber
    ) {
      return apiResponse.validationErrorWithData(
        res,
        "All fields are required",
        null
      );
    }
    const role_id = parseInt(req.body.role_id, 10);
    if (![2, 3].includes(role_id)) {
      return apiResponse.validationErrorWithData(
        res,
        "Invalid role_id for seller111",
        null
      );
    }

    // ✅ Check if seller already exists
    const existingSeller = await User.findOne({
      where: {
        role_id: [2, 3],
        [Op.or]: [{ email }, { phoneno: phone }],
      },
    });

    if (existingSeller) {
      let msg = "Seller already exists";
      if (existingSeller.email === email) msg = "Email already exists";
      if (existingSeller.phoneno === phone) msg = "Phone number already exists";
      return apiResponse.validationErrorWithData(res, msg, null);
    }

    // ✅ Hash password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Save User
    const user = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      phoneno: phone,
      role_id,
      status: "pending",
    });

    // ✅ Save Seller Profile
    const profile = await SellerProfile.create({
      user_id: user.id,
      firstName,
      lastName,
      pincode,
      shopName,
      shopAddress,
      pickupAddress,
      state,
      city,
      gstNumber,
      bankName,
      ifsc,
      accountNumber,
      shopImage: req.files?.shopImage?.[0]?.filename
        ? `/uploads/sellers/${req.files.shopImage[0].filename}`
        : null,
      adharCard: req.files?.adharCard?.[0]?.filename
        ? `/uploads/sellers/${req.files.adharCard[0].filename}`
        : null,
      panCard: req.files?.panCard?.[0]?.filename
        ? `/uploads/sellers/${req.files.panCard[0].filename}`
        : null,
      gstCertificate: req.files?.gstCertificate?.[0]?.filename
        ? `/uploads/sellers/${req.files.gstCertificate[0].filename}`
        : null,
      cancelCheck: req.files?.cancelCheck?.[0]?.filename
        ? `/uploads/sellers/${req.files.cancelCheck[0].filename}`
        : null
    });

    return apiResponse.successResponseWithData(
      res,
      "Seller registered successfully",
      {
        user,
        profile,
      }
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

export const changePassword = async (req, res) => {
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

    // ✅ Allow only role_id 2 and 3
    if (![2, 3].includes(user.role_id)) {
      return apiResponse.unauthorizedResponse(
        res,
        "You are not allowed to change password"
      );
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

    return apiResponse.successResponseWithData(res, "Password updated successfully");
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const decoded = req.user;
    const { name, phoneno } = req.body;

    const user = await User.findOne({ where: { id: decoded.id } });
    if (!user) {
      return apiResponse.notFoundResponse(res, "Seller not found");
    }

    // ✅ Allow only role_id 2 and 3
    if (![2, 3].includes(user.role_id)) {
      return apiResponse.unauthorizedResponse(
        res,
        "You are not allowed to update profile"
      );
    }

    user.name = name || user.name;
    user.phoneno = phoneno || user.phoneno;
    await user.save();

    return apiResponse.successResponseWithData(res, "Profile updated", user);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

export const genratePassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return apiResponse.validationErrorWithData(
        res,
        "Email and new password are required"
      );
    }

    // ✅ Fetch user only if role_id is 2 or 3
    const user = await User.findOne({
      where: {
        email,
        role_id: [2, 3], // 👈 Sequelize will treat this as IN [2,3]
      },
    });

    if (!user) {
      return apiResponse.notFoundResponse(res, "User not found or not allowed");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

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

export const profile = async (req, res) => {
  try {
    const decoded = req.user;

    const user = await User.findOne({
      where: { id: decoded.id },
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Role, // ✅ Assuming Role model is associated with User
          as: "role",  // ✅ The alias you used in your association
          attributes: ["id", "name"], // Only fetch what you need
        },
      ],
    });

    if (!user) return apiResponse.notFoundResponse(res, "User not found");

    // ✅ Format response (optional): add role_name directly
    const userData = {
      ...user.toJSON(),
      role_name: user.role ? user.role.name : null,
    };

    return apiResponse.successResponseWithData(res, "Profile fetched", userData);
  } catch (err) {
    console.error(err);
    return apiResponse.forbiddenResponse(res, "Invalid or expired token");
  }
};



