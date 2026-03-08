const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

const sessions = new Map();

app.post("/api/session/heartbeat", (req, res) => {
  const { sessionId, page, ts } = req.body;
  const existing = sessions.get(sessionId) || {};

  sessions.set(sessionId, {
    sessionId,
    page,
    lastSeen: ts || Date.now(),
    nextPage: existing.nextPage || null
  });

  res.json({ ok: true });
});

app.get("/api/session/status", (req, res) => {
  const { sessionId } = req.query;
  const session = sessions.get(sessionId);

  res.json({
    nextPage: session?.nextPage || null
  });
});

app.get("/api/admin/sessions", (req, res) => {
  const now = Date.now();
  const active = [...sessions.values()].filter(
    s => now - s.lastSeen < 15000
  );

  res.json(active);
});

app.post("/api/admin/redirect", (req, res) => {
  const { sessionId, nextPage } = req.body;

  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  session.nextPage = nextPage;
  sessions.set(sessionId, session);

  res.json({ ok: true });
});

app.listen(3000, () => {
  console.log("Server läuft auf http://localhost:3000");
});