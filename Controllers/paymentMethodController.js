import { PaymentMethod } from "../Models/paymentMethodModel.js"
import apiResponse from "../Helper/apiResponse.js";
import appapiResponse from "../Helper/appapiResponse.js";


export const addPaymentMethod = async (req, res) => {
  try {
    const { name, mode, key_id, key_secret, is_active } = req.body;

    if (!name) {
      return apiResponse.validationErrorWithData(res, "Validation Error", [
        { field: "name", message: "Name is required" },
      ]);
    }

    // ✅ Handle uploaded image
    let imagePath = null;
    if (req.file) {
      // If using local storage
      imagePath = `/uploads/icon/${req.file.filename}`;

      // OR if you want full URL (assuming your server domain is set)
      // imagePath = `${req.protocol}://${req.get("host")}/uploads/payment-methods/${req.file.filename}`;
    }

    const newMethod = await PaymentMethod.create({
      name,
      image: imagePath,
      mode,
      key_id,
      key_secret,
      is_active,
    });

    return apiResponse.successResponseWithData(
      res,
      "Payment method added successfully",
      newMethod
    );
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

export const updatePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const method = await PaymentMethod.findByPk(id);
    if (!method || method.is_deleted) {
      return apiResponse.notFoundResponse(res, "Payment method not found");
    }

    // ✅ Handle uploaded image
    if (req.file) {
      // If using local storage
      updates.image = `/uploads/icon/${req.file.filename}`;
    }

    await method.update(updates);

    return apiResponse.successResponseWithData(
      res,
      "Payment method updated successfully",
      method
    );
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};


// export const deletePaymentMethod = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const method = await PaymentMethod.findByPk(id);
//     if (!method || method.is_deleted) {
//       return apiResponse.notFoundResponse(res, "Payment method not found");
//     }

//     await method.update({ is_deleted: true, is_active: false });

//     return apiResponse.SuccessResponse(
//       res,
//       "Payment method deleted successfully"
//     );
//   } catch (error) {
//     return apiResponse.ErrorResponse(res, error.message);
//   }
// };


export const getAllPaymentMethods = async (req, res) => {
  try {
    const methods = await PaymentMethod.findAll({
     // where: { is_deleted: false },
      order: [["id", "ASC"]],
    });

    return apiResponse.successResponseWithData(res, "Payment methods fetched", methods);
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

export const getPaymentMethodById = async (req, res) => {
  try {
    const { id } = req.params;
    const method = await PaymentMethod.findByPk(id);

    // if (!method || method.is_deleted) {
    //   return apiResponse.notFoundResponse(res, "Payment method not found");
    // }

    return apiResponse.successResponseWithData(res, "Payment method fetched", method);
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

export const getAllPaymentMethodsapp = async (req, res) => {
  try {
    const methods = await PaymentMethod.findAll({
      where: { is_active: true },
      order: [["id", "ASC"]],
    });

    return appapiResponse.successResponseWithData(res, "Payment methods fetched", methods);
  } catch (error) {
    return appapiResponse.ErrorResponse(res, error.message);
  }
};

export const getAllPaymentMethodsweb = async (req, res) => {
  try {
    const methods = await PaymentMethod.findAll({
      where: { is_active: true },
      order: [["id", "ASC"]],
    });

    return apiResponse.successResponseWithData(res, "Payment methods fetched", methods);
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};
