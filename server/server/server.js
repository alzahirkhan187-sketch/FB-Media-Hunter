import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Facebook Download API (public endpoint)
app.post("/api/download", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "No URL provided" });
  }

  try {
    const api = `https://api.snapinsta.app/api/facebook?url=${encodeURIComponent(url)}`;
    const response = await fetch(api);
    const data = await response.json();

    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: "Failed to process request." });
  }
});

app.get("/", (req, res) => {
  res.send("FB Media Hunter Backend Running!");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
