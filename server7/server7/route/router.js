const route = require("express").Router();

const userRoutes = require("./sub-routes/userRouter");
const productRoutes = require("./sub-routes/productRouter");
const orderRoutes = require("./sub-routes/orderRouter");
const shipmentRoutes = require("./sub-routes/shipmentRouter");

route.use("/users", userRoutes);

route.use("/products", productRoutes);

 route.use("/orders",orderRoutes);

 route.use("/shipments", shipmentRoutes);

module.exports = route;
