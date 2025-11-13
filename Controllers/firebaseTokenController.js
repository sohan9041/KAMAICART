import { saveFirebaseToken } from "../Models/FirebaseModel.js";
//import apiResponse from "../Helper/apiResponse.js";
import appapiResponse from "../Helper/appapiResponse.js";

export const SaveFirebaseToken = async (req, res) => {
  try {
    const user = req.user; // 👈 this comes from auth middleware
    const { firebase_token,device_id } = req.body;

    if (!firebase_token) {
      return appapiResponse.validationErrorWithData(res, "Firebase token is required", null);
    }

    await saveFirebaseToken({
      user_id: user.id,
      token: firebase_token,
      device_id: device_id
    });

    return appapiResponse.successResponseWithData(res, "Firebase token saved successfully", {
      user_id: user.id,
      firebase_token,
      device_id
    });
  } catch (err) {
    return appapiResponse.ErrorResponse(res, err.message);
  }
};