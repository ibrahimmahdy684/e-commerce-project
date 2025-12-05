const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cart_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
    required: true
  },
  items: [{
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    product_name: String,
    price: Number,
    quantity: Number
  }],
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  payment_method: {
    type: String,
    enum: ['cash', 'credit'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  placed_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

// Indexes for faster queries
orderSchema.index({ user_id: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ placed_at: -1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;

