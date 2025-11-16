const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("FB Media Hunter Server Running");
});

app.get("/api/download", async (req, res) => {
  const url = req.query.url;

  if (!url) return res.json({ error: "Facebook URL required" });

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const video = $("meta[property='og:video']").attr("content");
    const image = $("meta[property='og:image']").attr("content");

    res.json({ video, image });
  } catch (err) {
    res.json({ error: "Failed to fetch media" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
