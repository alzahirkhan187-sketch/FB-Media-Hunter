// FB Media Hunter — Facebook Public Post Media Extractor
// Works only for PUBLIC posts. Legal OSINT usage only.

const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const morgan = require('morgan');
const { URL } = require('url');

const app = express();
app.use(express.json());
app.use(morgan('tiny'));

async function fetchHTML(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept-Language": "en-US,en"
    },
    redirect: "follow"
  });

  return { status: res.status, text: await res.text(), finalUrl: res.url };
}

app.post('/api/extract', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.json({ ok: false, error: "URL missing" });

    const { status, text, finalUrl } = await fetchHTML(url);
    if (status >= 400) return res.json({ ok: false, error: "Failed to fetch page" });

    const $ = cheerio.load(text);
    const media = [];

    $("meta").each((i, el) => {
      const prop = $(el).attr("property") || "";
      const content = $(el).attr("content") || "";

      if (prop.includes("og:video"))
        media.push({ type: "video", src: content });

      if (prop.includes("og:image"))
        media.push({ type: "image", src: content });
    });

    $("video").each((i, v) => {
      const src = $(v).attr("src");
      if (src) media.push({ type: "video", src });
    });

    $("img").each((i, img) => {
      const src = $(img).attr("src");
      if (src && src.startsWith("http"))
        media.push({ type: "image", src });
    });

    const unique = [];
    const seen = new Set();
    for (const m of media) {
      if (!seen.has(m.src)) {
        seen.add(m.src);
        unique.push(m);
      }
    }

    res.json({ ok: true, media: unique, finalUrl });

  } catch (err) {
    res.json({ ok: false, error: err.toString() });
  }
});

app.get('/proxy', async (req, res) => {
  try {
    const url = req.query.url;
    const r = await fetch(url);
    res.setHeader("Content-Type", r.headers.get("content-type"));
    r.body.pipe(res);
  } catch (e) {
    res.send("Proxy failed");
  }
});

app.listen(3000, () => console.log("Server running on 3000"));
