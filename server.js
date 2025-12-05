import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static("public")); // serve frontend files

// API endpoint
app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || prompt.trim() === "") return res.status(400).json({ error: "Prompt is required" });

    const HF_API_KEY = process.env.HF_API_KEY;
    if (!HF_API_KEY) return res.status(500).json({ error: "HF API key missing" });

    const HF_URL = "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0";

    const response = await fetch(HF_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("HF API Error:", errorData);
      return res.status(response.status).json({ error: "HF Model Error", details: errorData });
    }

    if (contentType?.includes("application/json")) {
      const errorData = await response.json();
      console.error("HF API JSON Error:", errorData);
      return res.status(400).json({ error: "HF Model Error", details: errorData });
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    res.json({ image: `data:image/png;base64,${base64Image}` });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Server failed", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
