
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

// Vercel fix: use /tmp for writable directory
const DATA_DIR = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

console.log(`Data dir: ${DATA_DIR}, Vercel: ${!!process.env.VERCEL}`);

// --- Your existing routes ---
// Keep your existing /api routes here, just make sure they use DATA_DIR
// Example placeholder - replace with your original logic but using DATA_DIR

// IMPORTANT: mail domains fallback for Vercel
app.get("/api/mail/domains", async (req, res) => {
  try {
    const r = await fetch("https://api.mail.tm/domains?page=1");
    if (!r.ok) throw new Error("mail.tm failed");
    const j = await r.json();
    const domains = (j["hydra:member"] || []).map((d:any)=>d.domain);
    if (domains.length === 0) throw new Error("empty");
    res.json(domains);
  } catch (e) {
    console.warn("Fallback to maxxspace.com", e);
    res.json(["maxxspace.com"]);
  }
});

// Serve frontend in production
const distPath = path.join(process.cwd(), "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) return res.status(404).json({error:"not found"});
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

export default app;
