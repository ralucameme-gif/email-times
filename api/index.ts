import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/mail/domains", async (req, res) => {
  try {
    const r = await fetch("https://api.mail.tm/domains?page=1");
    if (!r.ok) throw new Error("mail.tm fail");
    const j = await r.json() as any;
    const domains = (j["hydra:member"] || []).map((d: any) => d.domain).filter(Boolean);
    if (domains.length === 0) throw new Error("empty");
    res.json(domains);
  } catch (e) {
    console.warn("Fallback to maxxspace.com", e);
    res.json(["maxxspace.com"]);
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;
