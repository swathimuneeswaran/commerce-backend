const produtRoute = require("express").Router();
const { authentication, authorization } = require("../../middleware/auth.js");

const {
  postNewCategory, //
  postNewStyle, //
  postNewShippingPolicy, //
  postNewReturnPolicy, //
  postNewProduct, //
  postNewOffer, //
  getAllCategories, //
  getAllStyles, //
  getAllShippingPolicies, //
  getAllReturnPolicies, //
  getAllProducts, //
  getProductById, //
  getProductsByPage, //
  getProductByName, //
  getAllOffers, //
  updateCategory, //
  updateStyle, //
  updateShippingPolicy,
  updateReturnPolicy,
  updateProduct, //
  updateOffer,
  deleteOffer,
  deleteProduct,
  deleteReturnPolicy,
  deleteShippingPolicy,
  deleteStyle,
  deleteCategory, //
  getProductsByCategory,
  getProductsByColor,
  getProductsBySize,
  
} = require("../../controller/productAction.js");

//post
produtRoute.post("/categories", authorization, postNewCategory);
produtRoute.post("/styles", authorization, postNewStyle);
produtRoute.post("/shipping-policies", authorization, postNewShippingPolicy);
produtRoute.post("/return-policies", authorization, postNewReturnPolicy);
produtRoute.post("/upload-product", authorization, postNewProduct);
produtRoute.post("/offers", authorization, postNewOffer);

//get
produtRoute.get("/categories", authentication, getAllCategories);
produtRoute.get("/styles", authentication, getAllStyles);
produtRoute.get("/shipping-policies", authentication, getAllShippingPolicies);
produtRoute.get("/return-policies", authentication, getAllReturnPolicies);
produtRoute.get("/api/all", authentication, getAllProducts);
produtRoute.get("/:id", authentication, getProductById);
produtRoute.get("/api/list", authentication, getProductsByPage);
produtRoute.get("/api/offers", authentication, getAllOffers);

//put
produtRoute.put("/categories/:id", authorization, updateCategory);
produtRoute.put("/styles/:id", authorization, updateStyle);
produtRoute.put("/shipping-policies/:id", authorization, updateShippingPolicy);
produtRoute.put("/return-policies/:id", authorization, updateReturnPolicy);
produtRoute.put("/:id", authorization, updateProduct);
produtRoute.put("/offers/:id", authorization, updateOffer);

//delete
produtRoute.delete("/offers/:id", authorization, deleteOffer);
produtRoute.delete("/styles/:id", authorization, deleteStyle);
produtRoute.delete("/categories/:id", authorization, deleteCategory);
produtRoute.delete(
  "/shipping-policies/:id",
  authorization,
  deleteShippingPolicy
);
produtRoute.delete("/return-policies/:id", authorization, deleteReturnPolicy);
produtRoute.delete("/:id", authorization, deleteProduct);

//wishlist routes
// produtRoute.post("/wishlist", addToWishlist);
// produtRoute.get("/wishlist/:userId", viewWishlist);
// produtRoute.delete("/wishlist/:userId/:productId", deleteFromWishlist);

produtRoute.get("/category/:category", authentication, getProductsByCategory);
produtRoute.get("/color/:color", authentication, getProductsByColor);
produtRoute.get("/size/:size", authentication, getProductsBySize);
produtRoute.get("/name/:name", authentication, getProductByName);

module.exports = produtRoute;
