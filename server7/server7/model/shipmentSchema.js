const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "order",
    required: true,
  },
  shipper: {
    name: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
    },
    email: {
      type: String,
    },
    website: {
      type: String,
    },
  },
  trackingNumber: {
    type: String,
    trim: true,
  },
  shippingDate: {
    type: Date,
    default: Date.now,
  },
  estimatedDeliveryDate: {
    type: Date,
  },
  actualDeliveryDate: {
    type: Date,
  },
  shippingStatus: {
    type: String,
    enum: [
      "pending",
      "in_transit",
      "out_for_delivery",
      "delivered",
      "returned",
    ],
    default: "pending",
  },
  shippingAddress: {
    type: {
      type: String, // 'home', 'work', etc.
      required: true,
    },
    addressLine1: {
      type: String,
      required: true,
    },
    addressLine2: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },
  shipmentProgress: [
    {
      transitLocation: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        required: true,
      },
      status: {
        type: String,
        enum: ["arrived", "departed", "in_transit"],
        required: true,
      },
      notes: {
        type: String,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = {
  ShipmentSchema: mongoose.model("shipment", shipmentSchema),
};
