const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("FB Media Hunter Server Running");
});

app.get("/api/fetch", async (req, res) => {
  try {
    const postUrl = req.query.url;

    if (!postUrl) {
      return res.status(400).json({ error: "Missing Facebook post URL" });
    }

    const apiUrl = `https://graph.facebook.com/v17.0/?id=${postUrl}&access_token=652173566457794|c3ae5d9cce2b76a5dfe311ff47c6c90b`;

    const fbResponse = await fetch(apiUrl);
    const data = await fbResponse.json();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server Running"));
