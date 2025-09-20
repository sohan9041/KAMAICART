import { State } from "../Schema/state.js";
import { City } from "../Schema/city.js";
import apiResponse from "../Helper/apiResponse.js";

export const getStates = async (req, res) => {
  try {
    const states = await State.findAll();
    return apiResponse.successResponseWithData(res, "States fetched successfully", states);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

export const getCitiesByState = async (req, res) => {
  try {
    const { stateId } = req.params;
    const cities = await City.findAll({ where: { state_id: stateId } });
    return apiResponse.successResponseWithData(res, "Cities fetched successfully", cities);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};
