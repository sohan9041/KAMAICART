import appapiResponse from "../Helper/appapiResponse.js";
import apiResponse from "../Helper/apiResponse.js";

import {
  userAddress,
  createuserAddress,
  updateuserAddress,
  deleteuserAddress,
  getuserAddressById,
  getuserAddressByuserId,
} from "../Models/userAddressModel.js";

//Get Address
export const AppGetAddress = async (req, res) => {
  try {
    const decoded = req.user;
    const user = await getuserAddressByuserId(decoded.id);
    if (!user) return appapiResponse.notFoundResponse(res, "Address not found");
    return appapiResponse.successResponseWithData(res, "Address fetched", user);
  } catch (err) {
    return appapiResponse.ErrorResponse(res, err.message);
  }
};

// Get one address by ID
export const AppGetAddressById = async (req, res) => {
  try {
    const decoded = req.user;
    const id = req.params.id;

    const address = await getuserAddressById(id);

    if (!address || address.user_id !== decoded.id) {
      return appapiResponse.notFoundResponse(res, "Address not found");
    }

    return appapiResponse.successResponseWithData(res, "Address fetched", address);
  } catch (err) {
    return appapiResponse.ErrorResponse(res, err.message);
  }
};

//Add Address
export const AppAddAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    req.body.user_id = userId;

    // Convert string to boolean
    if (typeof req.body.default_address === "string") {
      req.body.default_address = req.body.default_address.toLowerCase() === "true";
    }

    if (req.body.default_address === true) {
      await userAddress.update(
        { default_address: false },
        { where: { user_id: userId } }
      );
    }

    const newAddress = await createuserAddress(req.body);

    return appapiResponse.successResponseWithData(
      res,
      "Address added",
      newAddress
    );
  } catch (err) {
    return appapiResponse.ErrorResponse(res, err.message);
  }
};


//Update Address
export const AppUpdateAddress = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    req.body.user_id = userId;

    // Convert string/number to boolean
    if (typeof req.body.default_address === "string") {
      req.body.default_address =
        req.body.default_address.toLowerCase() === "true" 
    }

    if (req.body.default_address === true) {
      await userAddress.update(
        { default_address: false },
        { where: { user_id: userId } }
      );
    }

    const address = await getuserAddressById(id);
    if (!address)
      return appapiResponse.notFoundResponse(res, "Address not found");

    const updatedAddress = await updateuserAddress(id, req.body);

    return appapiResponse.successResponseWithData(
      res,
      "Address updated",
      updatedAddress
    );
  } catch (err) {
    return appapiResponse.ErrorResponse(res, err.message);
  }
};

//Delete Address
export const AppDeleteAddress = async (req, res) => {
  try {
    //const decoded = req.user;
    const id = req.params.id;
    const address = await deleteuserAddress(id);
    if (!address)
      return appapiResponse.notFoundResponse(res, "Address not found");
    return appapiResponse.successResponseWithData(res, "Address deleted");
  } catch (err) {
    return appapiResponse.ErrorResponse(res, err.message);
  }
};

/**
 * Get all addresses for logged-in user (website)
 */
export const WebGetAddresses = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return apiResponse.ErrorResponse(res, "Unauthorized");
    }

    const addresses = await userAddress.findAll({
      where: { user_id: userId, is_deleted: false },
      order: [["default_address", "DESC"], ["createdAt", "DESC"]],
    });

    return apiResponse.successResponseWithData(
      res,
      "Addresses fetched successfully",
      addresses
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

/**
 * Add address for logged-in user (website)
 */
export const WebAddAddress = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return apiResponse.ErrorResponse(res, "Unauthorized");
    }

    const {
      name,
      phone_number,
      area,
      flat,
      postal_code,
      address1,
      address2,
      address_tag,
      default_address
    } = req.body;

    // ✅ If setting as default, unset any previous default
    if (default_address) {
      await userAddress.update(
        { default_address: false },
        { where: { user_id: userId, default_address: true } }
      );
    }

    // ✅ Create new address
    const newAddress = await userAddress.create({
      user_id: userId,
      name,
      phone_number,
      area,
      flat,
      postal_code,
      address1,
      address2,
      address_tag,
      default_address: default_address || false,
    });

    return apiResponse.successResponseWithData(
      res,
      "Address added successfully",
      newAddress
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};


/**
 * Update address by id (website)
 */
export const WebUpdateAddress = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const {
      name,
      phone_number,
      area,
      flat,
      postal_code,
      address1,
      address2,
      address_tag,
      default_address
    } = req.body;

    const address = await userAddress.findOne({
      where: { id, user_id: userId, is_deleted: false },
    });

    if (!address) {
      return apiResponse.notFoundResponse(res, "Address not found");
    }

    // ✅ If setting as default, unset previous default
    if (default_address) {
      await userAddress.update(
        { default_address: false },
        { where: { user_id: userId, default_address: true } }
      );
    }

    // ✅ Update address details
    await address.update({
      name,
      phone_number,
      area,
      flat,
      postal_code,
      address1,
      address2,
      address_tag,
      default_address: default_address || false,
    });

    return apiResponse.successResponseWithData(
      res,
      "Address updated successfully",
      address
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};


/**
 * Delete address by id (website)
 */
export const WebDeleteAddress = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const address = await userAddress.findOne({
      where: { id, user_id: userId, is_deleted: false },
    });

    if (!address) {
      return apiResponse.notFoundResponse(res, "Address not found");
    }

    await address.update({ is_deleted: true });

    return apiResponse.successResponseWithData(res, "Address deleted successfully");
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

export const WebGetAddressById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params.id;

    const address = await getuserAddressById(id);

    if (!address || address.user_id !== userId) {
      return apiResponse.notFoundResponse(res, "Address not found");
    }

    return apiResponse.successResponseWithData(res, "Address fetched", address);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};
