const express = require("express");
const cors = require("cors");
const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));

const app = express();
app.use(cors());

app.get("/search", async (req, res) => {
  const { q, sub } = req.query;
  if (!q) return res.status(400).json({ error: "Missing q param" });
  try {
    const base = sub ? `https://www.reddit.com/r/${sub}` : "https://www.reddit.com";
    const url = `${base}/search.json?q=${encodeURIComponent(q)}&sort=new&t=month&limit=15&raw_json=1`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ReferralBot/1.0)" }
    });
    if (!response.ok) return res.status(response.status).json({ error: "Reddit error" });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/health", (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
