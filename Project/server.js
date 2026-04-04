const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const pincodeRoutes = require("./routes/pincodeRoutes");

const app = express();

app.use(express.json());
app.use(cors());

connectDB();

app.use("/", pincodeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
