const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    trim: true,
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  addresses: [
    {
      type: {
        type: String, // 'home' or 'work', etc.
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
  ],
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
    },
  ],
  credit_points: {
    type: Number,
    default: 0,
    min: 0,
  },
  wallet: {
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    transactions: [
      {
        type: {
          type: String, // 'credit' or 'debit'
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        description: {
          type: String,
          trim: true,
        },
      },
    ],
  },
  wishlist: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      image: {
        fileId: { type: mongoose.Schema.Types.ObjectId, ref: "fs.files" },
        type: { type: String, required: true },
        filename: { type: String, required: true },
        size: { type: Number, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
      color: {
        type: String,
        required: true,
      },
      discount: {
        type: {
          type: String, // 'percentage' or 'amount'
          enum: ["percentage", "amount"],
          required: true,
        },
        value: {
          type: Number,
          required: true,
          min: 0,
        },
      },
      price: {
        type: Number,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  cart: {
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        image: {
          fileId: { type: mongoose.Schema.Types.ObjectId, ref: "fs.files" },
          type: { type: String, required: true },
          filename: { type: String, required: true },
          size: { type: Number, required: true },
          uploadedAt: { type: Date, default: Date.now },
        },
        color: {
          type: String,
          required: true,
        },
        discount: {
          type: {
            type: String, // 'percentage' or 'amount'
            enum: ["percentage", "amount"],
            required: true,
          },
          value: {
            type: Number,
            required: true,
            min: 0,
          },
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
  },
  role: {
    type: String,
    enum: ["customer", "admin"],
    default: "customer",
  },
  isverified: {
    type: Boolean,
    required: true,
    default: false,
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

const tokenSchema = mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
    unique: true,
  },

  token: { type: String, required: true },

  createdAt: { type: Date, default: Date.now(), expires: 36000 },
});

module.exports = {
  UserSchema: mongoose.model("user", userSchema),
  TokenSchema: mongoose.model("token", tokenSchema),
};
