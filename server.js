const express = require("express");
const cors = require("cors");
const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));

const app = express();
app.use(cors());

// Rotate user agents so Reddit doesn't block us
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

app.get("/search", async (req, res) => {
  const { q, sub } = req.query;
  if (!q) return res.status(400).json({ error: "Missing q param" });
  try {
    const base = sub ? `https://www.reddit.com/r/${sub}` : "https://www.reddit.com";
    const url = `${base}/search.json?q=${encodeURIComponent(q)}&sort=new&t=month&limit=15&raw_json=1`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": randomUA(),
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "Referer": "https://www.reddit.com/",
      }
    });
    if (!response.ok) {
      console.log(`Reddit returned ${response.status} for: ${url}`);
      return res.status(response.status).json({ error: `Reddit returned ${response.status}` });
    }
    const data = await response.json();
    res.json(data);
  } catch (e) {
    console.error("Fetch error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get("/health", (_, res) => res.json({ ok: true, time: new Date().toISOString() }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
