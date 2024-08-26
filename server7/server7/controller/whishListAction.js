const { UserSchema, TokenSchema } = require("../model/userSchema");
const { ProductSchema } = require("../model/productSchema");

exports.addToWishlist = async (req, res) => {
  const { userId, productId } = req.body;
  try {
    const product = await ProductSchema.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Check if the product is already in the user's wishlist
    const user = await UserSchema.findOne({
      _id: userId,
      wishlist: { $elemMatch: { productId } },
    });

    if (user) {
      return res.status(200).json({
        success: true,
        message: "Product added to wishlist.",
        wishlist: user["wishlist"],
      });
    }

    // Create the wishlist object based on the product details
    const wishList = {
      productId: product._id,
      name: product.name,
      image: product.images[0] ? { ...product.images[0].file } : {},
      color: product.color,
      discount: { ...product.discount },
      price: product.price,
    };

    const updatedList = await UserSchema.findByIdAndUpdate(
      userId,
      {
        $push: {
          wishlist: wishList,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist.",
      wishlist: updatedList["wishlist"],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

exports.deleteFromWishlist = async (req, res) => {
  const { productId } = req.params;
  const userId = req._id;
  try {
    // Find the user and pull the product from the wishlist
    const updatedList = await UserSchema.findByIdAndUpdate(
      userId,
      {
        $pull: {
          wishlist: { productId: productId },
        },
      },
      { new: true, select: "wishlist" } // Return the updated wishlist
    );

    // Check if the user exists and the product was removed
    if (!updatedList) {
      return res.status(404).json({
        success: false,
        message: "product not in wishlist.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist.",
      wishlist: updatedList.wishlist, // Return the updated wishlist
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};
