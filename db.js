const mongoose = require("mongoose");
require("dotenv").config();
const mongooURL = process.env.DB_local_URL;
//const mongooURL = process.env.DB_online_Url;
mongoose.connect(mongooURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("connected", () => {
  console.log("Connected to MongoDB server");
});
db.on("error", (err) => {
  console.log("MongoDB connection error:", err);
});
db.on("disconnected", () => {
  console.log("MongoDB disconnected");
});
module.exports = db;
