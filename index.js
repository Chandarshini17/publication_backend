const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Import Schema
const Publication = require(path.join(__dirname, "model/publicationSchema"));

// Middleware for Logging Requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://academicdevelopmentforum24:Publisher24@publisher.fcpbj.mongodb.net/publication",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("Connected to DB");
  } catch (err) {
    console.error("Database connection error:", err.message);
    process.exit(1); 
  }
};

// Routes
app.post("/publications", async (req, res) => {
  const { year, volume, issue, title, content, data, link } = req.body;

  try {
    const newPublication = new Publication({
      year,
      volume,
      issue,
      title,
      content,
      data,
      link,
    });
    await newPublication.save();
    res.status(201).json(newPublication);
  } catch (err) {
    console.error("Error creating publication:", err.message);
    res.status(400).json({ error: err.message });
  }
});

app.get("/publications", async (req, res) => {
  const { volume } = req.query;

  try {
    const query = volume ? { volume: Number(volume) } : {};
    const publications = await Publication.find(query);
    res.json(publications);
  } catch (err) {
    console.error("Error fetching publications:", err.message);
    res.status(500).json({ error: "Failed to fetch publications." });
  }
});

// Start Server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
