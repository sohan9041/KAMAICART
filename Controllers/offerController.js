import { Offer, saveOffer, getAllOffers, softDeleteOffer,getNotDeletedOffers } from "../Models/offerModel.js";
import apiResponse from "../Helper/apiResponse.js";

// ✅ Create Offer (image + title + optional link)
export const createOffer = async (req, res) => {
  try {
    if (!req.file) {
      return apiResponse.validationErrorWithData(res, "Image is required", null);
    }

    const data = {
      image: `/uploads/offer/${req.file.filename}`,
      title: req.body.title,
      link: req.body.link || null, // optional
    };

    const record = await saveOffer(data);
    return apiResponse.successResponseWithData(res, "Offer uploaded successfully", record);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Get All Offers
export const getOfferList = async (req, res) => {
  try {
    const records = await getAllOffers();

    const updatedRecords = records.map((offer) => ({
      id: offer.id,
      image: offer.image, // already includes BASE_URL if getter is set
      title: offer.title,
      link: offer.link || null,
    }));

    return apiResponse.successResponseWithData(res, "Fetched successfully", updatedRecords);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

export const getOfferListForWeb = async (req, res) => {
  try {
    const records = await getNotDeletedOffers();

    const updatedRecords = records.map((offer) => ({
      id: offer.id,
      image: offer.image, // already includes BASE_URL if getter is set
      title: offer.title,
      link: offer.link || null,
    }));

    return apiResponse.successResponseWithData(res, "Fetched successfully", updatedRecords);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// ✅ Soft Delete
export const deleteOffer = async (req, res) => {
  try {
    const record = await softDeleteOffer(req.params.id);
    if (!record) return apiResponse.notFoundResponse(res, "Offer not found", []);
    return apiResponse.successResponseWithData(res, "Deleted successfully");
  } catch (err) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};
