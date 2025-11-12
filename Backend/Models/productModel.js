const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  vendorId: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "Vendor", 
     required: true 
    },

  categoryId: {
     type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

  name: {
     type: String,
     required: true
     },

  description: {
     type: String 
    },

  quantity: {
     type: Number,
      default: 0 ,
      min: 0
    },

  price: {
     type: Number,
     required: true ,
     min: 0
    },

  rating: {
     type: Number,
      default: 0,
      min: 0,
      max: 5
     },

  createdAt: {
     type: Date,
     default: Date.now
     }
});

export default mongoose.model("Product", productSchema);
