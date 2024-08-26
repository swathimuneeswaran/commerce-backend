// Create a new order
const expressAsyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const {
  OrderSchema,
  PromoSchema,
} = require("../model/orderSchema.js");

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    console.log("Start createOrder");
    
    const { products, promo, customer } = req.body;
    console.log("Received products:", products);
    
    let totalAmount = 0;

    for (const item of products) {
      const productPrice = item.price * item.quantity;
      let discount = 0;
      
      if (item.discount) {
        if (item.discount.type === "percentage") {
          discount = (productPrice * item.discount.value) / 100;
        } else if (item.discount.type === "amount") {
          discount = item.discount.value;
        }
      }
      
      totalAmount += productPrice - discount;
    }

    console.log("Total amount after products:", totalAmount);

    if (promo) {
      console.log("Promo provided:", promo);
      const appliedPromo = await PromoSchema.findById(promo);
      if (appliedPromo) {
        console.log("Applied promo:", appliedPromo);
        // Apply promo discount to the totalAmount if applicable
      }
    }

    console.log("Creating order...");
    const order = new OrderSchema({ ...req.body, totalAmount });
    await order.save();

    // Populate the product details in the order
    

    console.log("Order saved and products populated:", order);
    res.status(201).json(order); // Ensure you send the response after order is saved and populated
  } catch (error) {
    console.error("Error in createOrder:", error);
    res.status(400).json({ message: error.message }); // Send an error response if something goes wrong
  }
};


// Get order by ID
exports.getOrderById = expressAsyncHandler(async (req, res) => {
  try {
    const order = await OrderSchema.findById(req.params.id)
      .populate("customer")
      .populate("products.productId")
      .populate("promo")
      .populate("offers");
      
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update order
exports.updateOrder = expressAsyncHandler(async (req, res) => {
  try {
    const order = await OrderSchema.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete order
exports.deleteOrder = expressAsyncHandler(async (req, res) => {
  try {
    const order = await OrderSchema.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order deleted successfully" }); // Return 200 OK with a success message
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
