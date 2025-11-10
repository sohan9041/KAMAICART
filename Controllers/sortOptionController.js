import { SortOption } from "../Models/sortOption.js";
import apiResponse from "../Helper/apiResponse.js";

/* =========================
   ✅ ADD Sort Option
========================= */
export const addSortOption = async (req, res) => {
  try {
    const { code, name, sort_order, status } = req.body;

    // Check for duplicate code
    const existing = await SortOption.findOne({ where: { code } });
    if (existing) {
      return apiResponse.validationErrorWithData(
        res,
        "Sort option with this code already exists"
      );
    }

    const newSortOption = await SortOption.create({
      code,
      name,
      sort_order,
      status,
    });

    return apiResponse.successResponseWithData(
      res,
      "Sort option added successfully",
      newSortOption
    );
  } catch (error) {
    console.error("Error adding sort option:", error);
    return apiResponse.ErrorResponse(res, error.message);
  }
};

/* =========================
   ✏️ EDIT Sort Option
========================= */
export const editSortOption = async (req, res) => {
  try {
    const { code, name, sort_order, status } = req.body;
    const { id } = req.params;

    const sortOption = await SortOption.findByPk(id);
    if (!sortOption)
      return apiResponse.notFoundResponse(res, "Sort option not found");

    await sortOption.update({ code, name, sort_order, status });

    return apiResponse.successResponseWithData(
      res,
      "Sort option updated successfully",
      sortOption
    );
  } catch (error) {
    console.error("Error editing sort option:", error);
    return apiResponse.ErrorResponse(res, error.message);
  }
};

/* =========================
   📋 GET All Sort Options
========================= */
export const getAllSortOptions = async (req, res) => {
  try {
    const sortOptions = await SortOption.findAll({
      order: [["sort_order", "ASC"]],
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    if (!sortOptions.length)
      return apiResponse.notFoundResponse(res, "No sort options found", []);

    return apiResponse.successResponseWithData(
      res,
      "Sort options fetched successfully",
      sortOptions
    );
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

/* =========================
   🔍 GET Sort Option by ID
========================= */
export const getSortOptionById = async (req, res) => {
  try {
    const sortOption = await SortOption.findByPk(req.params.id);

    if (!sortOption)
      return apiResponse.notFoundResponse(res, "Sort option not found", []);

    return apiResponse.successResponseWithData(
      res,
      "Sort option fetched successfully",
      sortOption
    );
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

/* =========================
   ❌ DELETE Sort Option
========================= */
export const deleteSortOption = async (req, res) => {
  try {
    const sortOption = await SortOption.findByPk(req.params.id);
    if (!sortOption)
      return apiResponse.notFoundResponse(res, "Sort option not found");

    await sortOption.destroy();

    return apiResponse.successResponseWithData(
      res,
      "Sort option deleted successfully"
    );
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};
