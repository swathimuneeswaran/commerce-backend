const userRoute = require("express").Router();
const { authentication } = require("../../middleware/auth.js");
const {
  createUser,
  loginUser,
  resetPassword,
  requestPassword,
  verifyUser,
  enterPassword,
  getUser,
} = require("../../controller/userAction.js");

userRoute.post("/register", createUser);
userRoute.post("/login", loginUser);
userRoute.get("/verify/:username", verifyUser);

userRoute.post("/request-password", requestPassword);
userRoute.get("/reset-password/:id/:token", enterPassword);
userRoute.post("/reset-password/:id/:token", resetPassword);

userRoute.get("/:username/getuser", authentication, getUser);

// userRoute.post("/wishlist", authentication, addToWishlist);
// userRoute.get("/wishlist/:userId", authentication, viewWishlist);
// userRoute.delete(
//   "/wishlist/:userId/:productId",
//   authentication,
//   deleteFromWishlist
// );

// userRoute.post("/cart", authentication, addToCart);
// userRoute.get("/cart/:userId", authentication, viewCart);
// userRoute.delete("/cart/:userId/:productId", authentication, deleteFromCart);

module.exports = userRoute;
