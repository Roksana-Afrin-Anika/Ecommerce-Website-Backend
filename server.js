const express = require("express");
const app = express();
const path = require("path");
const db = require("./db");
const cors = require("cors");
const allowedOrigins = ["https://Roksana-Afrin-Anika.github.io"];
app.use(
  cors({
    origin: allowedOrigins,
    methods: "GET,POST,PUT,DELETE",
  })
);
const bodyParser = require("body-parser");
app.use(bodyParser.json());
require("dotenv").config();
const PORT = process.env.PORT || 10000;

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Ecommerce API!");
});

// API routes
const userRoutes = require("./Routes/userRoutes");
app.use("/user", userRoutes);

const productRoutes = require("./Routes/productRoutes");
app.use("/product", productRoutes);

const cartRoutes = require("./Routes/cartRoutes");
app.use("/cart", cartRoutes);

const orderRoutes = require("./Routes/orderRoutes");
app.use("/order", orderRoutes);

const paymentRoutes = require("./Routes/paymentRoutes");
app.use("/payment", paymentRoutes);

// Serve static files from the React build directory
app.use(
  express.static(path.join(__dirname, "my-app", "build"))
);

// Serve the React app for any other requests (non-API)
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "my-app", "build", "index.html")
  );
});

app.listen(PORT, () => {
  console.log(`Ecommerce app listening on port ${PORT}`);
});
