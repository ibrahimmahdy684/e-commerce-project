// Load environment variables FIRST before any other imports
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/dbConnect");
const CategoryRouter = require("./Routes/CategoryRouter.js");
const orderRoutes = require("./Routes/orderRoutes");
const cartRoutes = require("./Routes/cartRoutes");
const productRoutes=require("./Routes/productRoutes");
const authRoutes = require("./Routes/authRoutes");
const userRoutes=require("./Routes/userRoutes");

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/categories", CategoryRouter);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/product",productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
