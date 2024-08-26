const mongoose = require("mongoose");

// Define the schema for the product model
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    heading: {
      type: String,
      required: true,
      trim: true,
    },
    detail: {
      type: String,
      
      trim: true,
    },
    specification: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    required: true,
  },
  style: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "style",
    required: true,
  },
  brand: {
    type: String,
    trim: true,
  },
  Material: {
    type: String,
    trim: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  images: [
    {
      file: {
        fileId: { type: mongoose.Schema.Types.ObjectId, ref: "productImages.files" }, // Reference to the GridFS file
        type: { type: String}, // MIME type of the image (e.g., image/jpeg, image/png)
        filename: { type: String }, // Original filename
        size: { type: Number}, // Size of the image in bytes
        uploadedAt: { type: Date, default: Date.now }, // Timestamp of when the image was uploaded
      },
      label: {
        type: String,
        required: true,
        trim: true,
      },
    },
  ],
  numReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      
      },
      description: {
        type: String,
       
        trim: true,
      },
      rating: {
        type: Number,
       
        min: 0,
        max: 5,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  shippingPolicy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "shippingPolicy",
    required: true,
  },
  returnPolicy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "returnPolicy",
    required: true,
  },
  discount: {
    type: {
      type: String, // 'percentage' or 'amount'
      enum: ["percentage", "amount"],
      
    },
    value: {
      type: Number,
    
      min: 0,
    },
  },
  gender: {
    type: String,
    enum: ["male", "female", "unisex"],
    required: true,
  },
  size: [
    {
      type: String,
      trim: true,
    },
  ],
  color: [
    {
      type: String,
      trim: true,
    },
  ],
  section: {
    type: String,
    trim: true,
   
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

// Define the schema for styles
const styleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
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

// Define the schema for categories
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
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

// Define the schema for shipping policy
const shippingPolicySchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
    enum: ["Standard", "Express", "Next-Day"],
    default: "Standard",
  },
  cost: {
    type: Number,
    required: true,
    min: 0,
  },
  estimatedDelivery: {
    type: String, // e.g., "5-7 business days"
    required: true,
  },
  regions: [
    {
      type: String,
      required: true,
    },
  ],
  handlingTime: {
    type: String, // e.g., "1-2 business days"
    required: true,
  },
},
{
  timestamps: true,
}
);

// Define the schema for return policy
const returnPolicySchema = new mongoose.Schema({
  window: {
    type: String, // e.g., "30 days"
    required: true,
  },
  conditions: {
    type: String, // e.g., "Item must be unused and in original packaging."
    required: true,
  },
  process: {
    type: String, // e.g., "Return requests can be made via our website or customer service."
    required: true,
  },
  shippingFee: {
    type: Number,
    min: 0,
  },
},
{
  timestamps: true,
});

// Define the schema for offers
const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  applicableTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  buyQuantity: {
    type: Number,
    required: true,
    min: 1, // Number of items the customer must buy
  },
  getQuantity: {
    type: Number,
    required: true,
    min: 0, // Number of items the customer gets a discount on
  },
  discount: {
    type: {
      type: String,
      enum: ["percentage", "amount"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
  },
});

module.exports = {
  ProductSchema: mongoose.model("product", productSchema),
  StyleSchema: mongoose.model("style", styleSchema),
  CategorySchema: mongoose.model("category", categorySchema),
  ShippingPolicySchema: mongoose.model("shippingPolicy", shippingPolicySchema),
  ReturnPolicySchema: mongoose.model("returnPolicy", returnPolicySchema),
  OfferSchema: mongoose.model("offer", offerSchema),
};
