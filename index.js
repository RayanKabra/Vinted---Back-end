const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const cloudinary = require("cloudinary").v2;

const app = express();

app.use(express.json());
app.use(cors());

require("dotenv").config();
// Connexion DB Mongo
mongoose.connect(process.env.MONGODB_URI);

// Connexion à cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// import de mes routes
const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");

// utilisation de mes routes
app.use(userRoutes);
app.use(offerRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ error: "Cette route n'existe pas" });
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
