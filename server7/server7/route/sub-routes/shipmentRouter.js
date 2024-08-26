const express = require("express");
const router = express.Router();
const { createShipment, getShipmentById, updateShipment, deleteShipment } = require("../../controller/shipmentAction");
const { authentication, authorization } = require('../../middleware/auth');

// Routes for shipments
router.post("/", authentication, authorization, createShipment);
router.get("/api/:id", authentication, getShipmentById);
router.put("/api/:id", authentication, authorization, updateShipment);
router.delete("/api/:id", authentication, authorization, deleteShipment);

module.exports = router;
