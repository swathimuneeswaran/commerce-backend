const express = require("express");
const router = express.Router();
const { createOrder, getOrderById, updateOrder, deleteOrder } = require("../../controller/orderAction.js");
const { authentication, authorization } = require("../../middleware/auth.js");

// Routes for orders
router.post("/", authentication, authorization, createOrder);
router.get("/api/:id", authentication, getOrderById);
router.put("/api/:id", authentication, authorization, updateOrder);
router.delete("/api/:id", authentication, authorization, deleteOrder);

module.exports = router;
