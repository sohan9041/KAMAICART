import Wishlist from "../Schema/wishlist.js";
import Product from "../Schema/product.js";
import ProductImage from "../Schema/productImage.js";
import appapiResponse from "../Helper/appapiResponse.js";

// Add to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;
    const userId = req.user.id; // ✅ from auth middleware

    // prevent duplicates
    const existing = await Wishlist.findOne({
      where: { user_id: userId, product_id },
    });
    if (existing) {
      return appapiResponse.ErrorResponse(res, "Already in wishlist");
    }

    const wishlist = await Wishlist.create({
      user_id: userId,
      product_id
    });

    return appapiResponse.successResponseWithData(
      res,
      "Added to wishlist",
      wishlist
    );
  } catch (error) {
    return appapiResponse.ErrorResponse(res, error.message);
  }
};

// Get wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const items = await Wishlist.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: "product",
          where: { is_deleted: false },
          attributes: ["id", "name"],
          include: [
            {
              model: ProductImage,
              as: "images",
              where: { is_deleted: false },
              required: false,
              attributes: ["id", "image_url", "is_primary"],
            },
          ],
        },
      ],
    });

    const formatted = items.map((i) => ({
      id: i.id,
      product_id: i.product.id,
      product_name: i.product.name,
      thumbnail:
        i.product.images.find((img) => img.is_primary)?.image_url ||
        i.product.images[0]?.image_url ||
        null
    }));

    return appapiResponse.successResponseWithData(
      res,
      "Wishlist fetched successfully",
      formatted
    );
  } catch (error) {
    return appapiResponse.ErrorResponse(res, error.message);
  }
};

// Remove from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = await Wishlist.destroy({
      where: { id, user_id: userId },
    });

    if (!deleted) {
      return appapiResponse.ErrorResponse(res, "Item not found in wishlist");
    }

    return appapiResponse.successResponse(res, "Removed from wishlist");
  } catch (error) {
    return appapiResponse.ErrorResponse(res, error.message);
  }
};
