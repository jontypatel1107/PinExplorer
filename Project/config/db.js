const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb+srv://JontyPatel1107:JiyaJonty2511@cluster0.yujjuv4.mongodb.net/Pincode?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("MongoDB Connected");
  } catch (err) {
    console.log("DB Error:", err);
  }
};

module.exports = connectDB;
