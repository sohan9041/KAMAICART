import { PromoCode } from "../Models/promoCode.js";
import apiResponse from "../Helper/apiResponse.js";

/**
 * ✅ Create Promo Code
 */
export const createPromoCode = async (req, res) => {
  try {
    const data = req.body;

    // Check if promo code already exists (and not deleted)
    const existing = await PromoCode.findOne({
      where: { code: data.code, is_deleted: false },
    });
    if (existing)
      return apiResponse.ErrorResponse(res, "Promo code already exists");

    const promo = await PromoCode.create(data);
    return apiResponse.successResponseWithData(
      res,
      "Promo code created successfully",
      promo
    );
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

/**
 * ✅ Get All Promo Codes
 */
export const getAllPromoCodes = async (req, res) => {
  try {
    const promos = await PromoCode.findAll({
      where: { is_deleted: false },
      order: [["id", "DESC"]],
    });

    return apiResponse.successResponseWithData(
      res,
      "Promo codes fetched successfully",
      promos
    );
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

/**
 * ✅ Get Promo Code by ID
 */
export const getPromoCodeById = async (req, res) => {
  try {
    const { id } = req.params;

    const promo = await PromoCode.findOne({
      where: { id, is_deleted: false },
    });

    if (!promo)
      return apiResponse.notFoundResponse(res, "Promo code not found");

    return apiResponse.successResponseWithData(
      res,
      "Promo code fetched successfully",
      promo
    );
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

/**
 * ✅ Update Promo Code
 */
export const updatePromoCode = async (req, res) => {
  try {
    const { id } = req.params;

    const promo = await PromoCode.findOne({
      where: { id, is_deleted: false },
    });

    if (!promo)
      return apiResponse.notFoundResponse(res, "Promo code not found");

    await promo.update(req.body);

    return apiResponse.successResponseWithData(
      res,
      "Promo code updated successfully",
      promo
    );
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

/**
 * ✅ Soft Delete Promo Code
 */
export const deletePromoCode = async (req, res) => {
  try {
    const { id } = req.params;

    const promo = await PromoCode.findOne({
      where: { id, is_deleted: false },
    });

    if (!promo)
      return apiResponse.notFoundResponse(res, "Promo code not found");

    await promo.update({ is_deleted: true });

    return apiResponse.successResponseWithData(
      res,
      "Promo code deleted successfully"
    );
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};
