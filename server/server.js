const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 3000;

// Replace with your actual API key
const API_KEY = process.env.GEMINI_API_KEY;

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(API_KEY);

app.use(cors());
app.use(express.json());

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.post("/summarize", async (req, res) => {
  try {
    const { content, level } = req.body;

    // Convert level to a descriptive string
    const levelDescriptions = [
      "very detailed",
      "detailed",
      "moderate",
      "brief",
      "very brief",
    ];
    const levelDescription = levelDescriptions[level - 1] || "moderate";

    // Use Google's Gen AI to summarize the content
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(
      `Provide a ${levelDescription} summary of the following text:\n\n${content}`
    );
    const summary = result.response.text();
    res.json({ summary });
  } catch (error) {
    console.error("Error in /summarize route:", error);
    res
      .status(500)
      .json({ error: "An error occurred while summarizing the content." });
  }
});
