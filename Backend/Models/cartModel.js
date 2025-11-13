const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  item_list: [{
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
cartSchema.index({ user_id: 1 });

// Method to find item in cart
cartSchema.methods.findItem = function(productId) {
  return this.item_list.find(
    item => item.product_id.toString() === productId.toString()
  );
};

// Method to add or update item
cartSchema.methods.addOrUpdateItem = function(productId, quantity) {
  const existingItem = this.findItem(productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.item_list.push({ product_id: productId, quantity });
  }

  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.item_list.id(itemId);
  if (item) {
    item.quantity = quantity;
  }
  return this.save();
};

// Method to remove item
cartSchema.methods.removeItem = function(itemId) {
  this.item_list = this.item_list.filter(
    item => item._id.toString() !== itemId.toString()
  );
  return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.item_list = [];
  return this.save();
};

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;

