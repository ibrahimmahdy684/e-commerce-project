const app = require("./app");
const connectDB = require("./config/dbConnect");

// Connect DB ONLY when running server
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
