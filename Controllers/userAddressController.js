import appapiResponse from "../Helper/appapiResponse.js";
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
    //const decoded = req.user;
    const id = req.params.id;

    const userId = req.user.id;
    req.body.user_id = userId;

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
    return appapiResponse.successResponse(res, "Address deleted");
  } catch (err) {
    return appapiResponse.ErrorResponse(res, err.message);
  }
};
