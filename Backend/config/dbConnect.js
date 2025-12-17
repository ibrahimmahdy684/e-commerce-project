const mongoose = require('mongoose');

/**
 * @desc    Connect to MongoDB database
 * @param   {string} mongoURI - MongoDB connection URI from environment variables
 * @returns {Promise} - Resolves when connection is established
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error('MongoDB connection URI not found in environment variables (MONGODB_URI or MONGO_URI)');
    }

    const connection = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`MongoDB Connected to`, mongoURI);
    return connection;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Exit process with failure code
    process.exit(1);
  }
};

module.exports = connectDB;
