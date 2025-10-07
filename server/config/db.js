/**
 * MongoDB connection helper using Mongoose.
 *
 * Loads the connection URI from the environment variable MONGODB_URI.
 * Example local connection string:
 *   MONGODB_URI=mongodb://localhost:27017/galil-workshops
 *
 * On success, logs the connected host name.
 * On failure, logs the error and exits the process.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Try connecting to MongoDB using the URI defined in .env
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,     // Use the new MongoDB URL parser
      useUnifiedTopology: true,  // Use the new unified server discovery engine
    });

    // Log success message with the connected host (useful for debugging)
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

  } catch (error) {
    // If connection fails, log the error and stop the server
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit process with failure
  }
};

// Export function to be used in server.js
module.exports = connectDB;
