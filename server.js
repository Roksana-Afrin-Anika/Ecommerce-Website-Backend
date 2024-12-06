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
const PORT = process.env.PORT || 5000;

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

// Serve static files from the build folder
app.use(express.static(path.join(__dirname, 'build')));

// Serve the frontend for any unknown route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Ecommerce app listening on port ${PORT}`);
});
