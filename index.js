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
    );
    console.log("Connected to DB");
  } catch (err) {
    console.error("Database connection error:", err.message);
    process.exit(1); 
  }
};

// Routes

// 1. Fetch all distinct years
app.get("/years", async (req, res) => {
  try {
    const years = await Publication.distinct("year");
    res.json(years);
  } catch (err) {
    console.error("Error fetching years:", err.message);
    res.status(500).json({ error: "Failed to fetch years." });
  }
});

// 2. Fetch volumes under a specific year
app.get("/volumes", async (req, res) => {
  const { year } = req.query;

  if (!year) {
    return res.status(400).json({ error: "Year parameter is required." });
  }

  try {
    const volumes = await Publication.find({ year: Number(year) }).distinct("volume");
    res.json(volumes);
  } catch (err) {
    console.error("Error fetching volumes:", err.message);
    res.status(500).json({ error: "Failed to fetch volumes." });
  }
});

// 3. Fetch data for a specific year and volume
app.get("/publications", async (req, res) => {
  const { year, volume, issue, isSpecialIssue } = req.query;

  try {
    const query = {};
    if (year) query.year = Number(year);
    if (volume) query.volume = volume;
    if (issue) query.issue = Number(issue);
    if (isSpecialIssue !== undefined) query.isSpecialIssue = isSpecialIssue === "true";

    const publications = await Publication.find(query);
    res.json(publications);
  } catch (err) {
    console.error("Error fetching publications:", err.message);
    res.status(500).json({ error: "Failed to fetch publications." });
  }
});

app.get("/special-issues", async (req, res) => {
  try {
    const specialIssues = await Publication.find({ isSpecialIssue: true });

    res.json(specialIssues);
  } catch (err) {
    console.error("Error fetching special issues:", err.message);
    res.status(500).json({ error: "Failed to fetch special issues." });
  }
});


// 4. Delete a publication by ID
app.delete("/publications/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Publication ID is required." });
  }

  try {
    const deletedPublication = await Publication.findByIdAndDelete(id);

    if (!deletedPublication) {
      return res.status(404).json({ error: "Publication not found." });
    }

    res.json({ message: "Publication deleted successfully.", data: deletedPublication });
  } catch (err) {
    console.error("Error deleting publication:", err.message);
    res.status(500).json({ error: "Failed to delete publication." });
  }
});

// 5. Add a new publication
app.post("/publications", async (req, res) => {
  const { year, volume, issue, title, content, data, link, isSpecialIssue } = req.body;

  // Validate required fields
  if (!year || !volume || !issue || !title || !content || !link) {
    return res.status(400).json({ error: "All required fields must be provided." });
  }

  try {
    // Create a new publication
    const newPublication = new Publication({
      year,
      volume,
      issue,
      title,
      content,
      data, // Optional field
      link,
      isSpecialIssue: isSpecialIssue !== undefined ? isSpecialIssue : false,
    });

    // Save to the database
    const savedPublication = await newPublication.save();

    res.status(201).json({
      message: "Publication added successfully.",
      data: savedPublication,
    });
  } catch (err) {
    console.error("Error adding publication:", err.message);
    res.status(500).json({ error: "Failed to add publication." });
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
