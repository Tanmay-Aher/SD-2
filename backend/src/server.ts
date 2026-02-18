import dotenv from "dotenv";
dotenv.config(); // MUST be first

import express from "express";
import connectDB from "./config/database.js";

const app = express();

// Debug (temporary)
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);

connectDB();

app.use(express.json());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
