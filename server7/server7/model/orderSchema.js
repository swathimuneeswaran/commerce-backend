const mongoose = require("mongoose");

// Define the schema for the order model
const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  fromAddress: {
    type: {
      type: String, // 'home', 'work', etc.
    },
    addressLine1: {
      type: String,
    },
    addressLine2: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    postalCode: {
      type: String,
    },
    country: {
      type: String,
    },
  },
  address: {
    type: {
      type: String, // 'home', 'work', etc.
    },
    addressLine1: {
      type: String,
    },
    addressLine2: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    postalCode: {
      type: String,
    },
    country: {
      type: String,
    },
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
      },
  //     name: {
  //       type: String,
  //       trim: true,
  //     },
  //     brand: {
  //       type: String,
  //       trim: true,
  //     },
  //     image: {
  //       fileId: { type: mongoose.Schema.Types.ObjectId, ref: "fs.files" },
  //       type: { type: String },
  //       filename: { type: String },
  //       size: { type: Number },
  //       uploadedAt: { type: Date, default: Date.now },
  //     },
  //     gender: {
  //       type: String,
  //       enum: ["male", "female", "unisex"],
  //       required: true,
  //     },
  //     size: [
  //       {
  //         type: String,
  //         trim: true,
  //       },
  //     ],
  //     color: [
  //       {
  //         type: String,
  //         trim: true,
  //       },
  //     ],
  //     section: {
  //       type: String,
  //       trim: true,
  //       required: true,
  //     },
  //     quantity: {
  //       type: Number,
  //       required: true,
  //       min: 1,
  //     },
  //     price: {
  //       type: Number,
  //       required: true,
  //       min: 0,
  //     },
  //     discount: {
  //       type: {
  //         type: String, // 'percentage' or 'amount'
  //         enum: ["percentage", "amount"],
  //         required: true,
  //       },
  //       value: {
  //         type: Number,
  //         required: true,
  //         min: 0,
  //       },
  //     },
  //     shippingPolicy: {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "shippingPolicy",
  //       required: true,
  //     },
  //     returnPolicy: {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "returnPolicy",
  //       required: true,
  //     },
    },
  ],
  offers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "offer",
    },
  ],
  promo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "promo",
  },
  shippedBy: {
    type: String, // E.g., 'FedEx', 'UPS', etc.
    trim: true,
  },
  deliveryDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["pending", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  totalAmount: {
    type: Number,
     min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const promoSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ["percentage", "amount"], // Type of promo: percentage discount or fixed amount discount
    
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  expirationDate: {
    type: Date,
    
  },
  usageLimit: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      
    },
  ],
  appliedCount: {
    type: Number,
    default: 0,
    min: 0,
  },
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
  OrderSchema: mongoose.model("order", orderSchema),
  PromoSchema: mongoose.model("promo", promoSchema),
};
