import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  street: { type: String },
  city: { type: String },
  buildingName: { type: String },
  apartmentNo: { type: String },
  description: { type: String },
});

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'admin'],
    required: true,
    default: 'user',
  },

  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
    minLength: 8,
  },

  points: {
     type: Number,
     default: 0 ,
     min: 0
    },

  phone: {
     type: String 
    },

  address: addressSchema,

  createdAt: { 
    type: Date,
    default: Date.now
     },
});

export default mongoose.model('User', userSchema);
