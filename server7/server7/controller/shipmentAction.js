const { ShipmentSchema } = require("../model/shipmentSchema");
const expressAsyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

// Create a new shipment
exports.createShipment = expressAsyncHandler(async (req, res) => {
  try {
    const shipment = new ShipmentSchema(req.body);
    await shipment.save();
    res.status(201).json(shipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get shipment by ID
exports.getShipmentById = expressAsyncHandler(async (req, res) => {
  try {
    const shipment = await ShipmentSchema.findById(req.params.id).populate("order");
    if (!shipment) return res.status(404).json({ message: "Shipment not found" });
    res.status(200).json(shipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update shipment
exports.updateShipment = expressAsyncHandler(async (req, res) => {
  try {
    const shipment = await ShipmentSchema.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!shipment) return res.status(404).json({ message: "Shipment not found" });
    res.status(200).json(shipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete shipment
// exports.deleteShipment = expressAsyncHandler(async (req, res) => {
//   try {
//     const shipment = await ShipmentSchema.findByIdAndDelete(req.params.id);
//     if (!shipment) return res.status(404).json({ message: "Shipment not found" });
//     res.status(204).end();
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// Delete shipment
exports.deleteShipment = expressAsyncHandler(async (req, res) => {
  try {
    console.log("Delete request received for shipment ID:", req.params.id);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid shipment ID" });
    }

    const shipment = await ShipmentSchema.findByIdAndDelete(req.params.id);

    if (!shipment) {
      console.log("Shipment not found");
      return res.status(404).json({ message: "Shipment not found" });
    }

    console.log("Shipment deleted successfully");
    res.status(200).json({ message: "Shipment deleted successfully" }); // Return 200 OK with a success message
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ message: error.message });
  }
});

