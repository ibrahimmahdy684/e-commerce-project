const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/dbConnect");
const CategoryRouter = require("./Routes/CategoryRouter.js");
const orderRoutes = require("./Routes/orderRoutes");
const cartRoutes = require("./Routes/cartRoutes");
//routers

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.use("/categories", CategoryRouter);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
