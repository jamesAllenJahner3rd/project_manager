const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    // the second argurements are to avoid warnings in the console.
    const conn = await mongoose.connect(process.env.DB_STRING, {
      serverSelectionTimeoutMS: 10000, // Optional: shorter timeout
      socketTimeoutMS: 45000, // Optional: longer socket timeout
      family: 4, // Use IPv4
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); //this exits the promise , 1 means failure
  }
};
module.exports = connectDB; // now we can use it in the app.js file
