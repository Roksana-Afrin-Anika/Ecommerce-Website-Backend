const express = require("express");
const app = express();
const path = require("path");
const db = require("./db");
const cors = require("cors");
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "https://ecommerce-website-1-k56z.onrender.com",
      "http://localhost:3000", // For local testing
    ];
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
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
